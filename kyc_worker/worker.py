import argparse
import hashlib
import hmac
import io
import os
import re
import tempfile
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from difflib import SequenceMatcher
from typing import Any

import numpy as np
import requests
from PIL import Image
from rapidocr_onnxruntime import RapidOCR


PAN_RE = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
PINCODE_RE = re.compile(r"\b[1-9][0-9]{5}\b")
DATE_RE = re.compile(r"\b([0-3]?\d[-/][01]?\d[-/](?:19|20)\d{2}|(?:19|20)\d{2}[-/][01]?\d[-/][0-3]?\d)\b")
NOISE_WORDS = {
    "INCOME",
    "TAX",
    "DEPARTMENT",
    "GOVT",
    "GOVERNMENT",
    "INDIA",
    "PERMANENT",
    "ACCOUNT",
    "NUMBER",
    "CARD",
    "NAME",
    "FATHER",
    "SIGNATURE",
    "DOB",
    "BIRTH",
    "DATE",
}


@dataclass
class SupabaseConfig:
    url: str
    service_role_key: str
    worker_id: str


class SupabaseRest:
    def __init__(self, config: SupabaseConfig):
        self.config = config
        self.base = config.url.rstrip("/")
        self.headers = {
            "apikey": config.service_role_key,
            "authorization": f"Bearer {config.service_role_key}",
            "content-type": "application/json",
        }

    def get(self, table: str, params: dict[str, str]) -> list[dict[str, Any]]:
        response = requests.get(f"{self.base}/rest/v1/{table}", headers=self.headers, params=params, timeout=30)
        response.raise_for_status()
        return response.json()

    def patch(self, table: str, params: dict[str, str], payload: dict[str, Any]) -> None:
        headers = {**self.headers, "prefer": "return=minimal"}
        response = requests.patch(
            f"{self.base}/rest/v1/{table}",
            headers=headers,
            params=params,
            json=payload,
            timeout=30,
        )
        response.raise_for_status()

    def post(self, table: str, payload: dict[str, Any] | list[dict[str, Any]]) -> None:
        headers = {**self.headers, "prefer": "return=minimal"}
        response = requests.post(f"{self.base}/rest/v1/{table}", headers=headers, json=payload, timeout=30)
        response.raise_for_status()

    def download_storage_object(self, bucket: str, path: str) -> bytes:
        encoded_path = "/".join(requests.utils.quote(part, safe="") for part in path.split("/"))
        response = requests.get(
            f"{self.base}/storage/v1/object/{bucket}/{encoded_path}",
            headers={
                "apikey": self.config.service_role_key,
                "authorization": f"Bearer {self.config.service_role_key}",
            },
            timeout=60,
        )
        response.raise_for_status()
        return response.content


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def send_email(to_email: str | None, subject: str, body: str) -> None:
    api_key = os.environ.get("RESEND_API_KEY")
    from_email = os.environ.get("CONTACT_FROM_EMAIL", "Vriksha Capital <enquiry@vriksha-capital.com>")
    if not api_key or not to_email:
        return
    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "authorization": f"Bearer {api_key}",
            "content-type": "application/json",
        },
        json={
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "text": body,
        },
        timeout=15,
    )
    response.raise_for_status()


def notify_kyc_status(profile: dict[str, Any], status: str) -> None:
    name = profile.get("full_name") or "Client"
    if status == "auto_verified":
        send_email(
            profile.get("email"),
            "Your Vriksha KYC is verified",
            f"Hello {name},\n\nYour KYC has been automatically verified. You can now proceed to checkout.\n\nVriksha Capital",
        )
    elif status == "manual_review_required":
        send_email(
            profile.get("email"),
            "Your Vriksha KYC is under review",
            f"Hello {name},\n\nYour KYC has been routed to compliance review. We will update you once the review is complete.\n\nVriksha Capital",
        )
        admin_email = os.environ.get("KYC_ADMIN_EMAIL") or os.environ.get("CONTACT_TO_EMAIL")
        send_email(
            admin_email,
            "KYC review required",
            f"KYC review is required for {name} ({profile.get('email')}). Open /admin/kyc to review the case.",
        )


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.upper()).strip()


def normalize_token(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", value.upper())


def token_set(value: str) -> set[str]:
    return {
        token
        for token in re.split(r"[^A-Z0-9]+", normalize_text(value))
        if len(token) >= 2 and token not in NOISE_WORDS
    }


def hash_sensitive_value(value: str) -> str:
    pepper = os.environ.get("KYC_HASH_PEPPER") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "local-kyc-pepper"
    return hmac.new(pepper.encode("utf-8"), value.strip().upper().encode("utf-8"), hashlib.sha256).hexdigest()


def ratio(a: str, b: str) -> float:
    return round(SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio() * 100, 2)


def normalize_date(value: str) -> str | None:
    cleaned = value.strip().replace("/", "-")
    parts = cleaned.split("-")
    if len(parts) != 3:
        return None
    if len(parts[0]) == 4:
        yyyy, mm, dd = parts
    else:
        dd, mm, yyyy = parts
    return f"{int(yyyy):04d}-{int(mm):02d}-{int(dd):02d}"


def render_pdf_first_page(content: bytes) -> Image.Image:
    try:
        import pypdfium2 as pdfium
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "PDF KYC documents require pypdfium2. Install worker dependencies with: "
            "pip install -r requirements.txt"
        ) from exc

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name
    try:
        pdf = pdfium.PdfDocument(tmp_path)
        page = pdf[0]
        bitmap = page.render(scale=2.0)
        image = bitmap.to_pil()
        page.close()
        pdf.close()
        return image
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def load_image(content: bytes, mime_type: str) -> Image.Image:
    if mime_type == "application/pdf":
        return render_pdf_first_page(content)
    return Image.open(io.BytesIO(content)).convert("RGB")


def run_ocr(engine: RapidOCR, image: Image.Image) -> tuple[str, float]:
    result, _ = engine(np.array(image.convert("RGB")))
    if not result:
        return "", 0.0
    lines = []
    confidences = []
    for item in result:
        if len(item) >= 3:
            lines.append(str(item[1]))
            try:
                confidences.append(float(item[2]))
            except (TypeError, ValueError):
                pass
    average_confidence = round((sum(confidences) / len(confidences)) * 100, 2) if confidences else 0.0
    return "\n".join(lines), average_confidence


def extract_pan_name_candidates(lines: list[str]) -> list[str]:
    candidates: list[str] = []
    for raw_line in lines:
        line = normalize_text(raw_line)
        if not line or PAN_RE.search(line) or DATE_RE.search(line):
            continue
        if any(word in line for word in NOISE_WORDS):
            continue
        words = [word for word in re.split(r"[^A-Z]+", line) if len(word) >= 2]
        if 1 <= len(words) <= 5:
            candidates.append(" ".join(words))
    return candidates[:8]


def extract_address_block(lines: list[str], pincode: str | None) -> str | None:
    if not lines:
        return None
    normalized_lines = [normalize_text(line) for line in lines if normalize_text(line)]
    if not normalized_lines:
        return None
    if pincode:
        for index, line in enumerate(normalized_lines):
            if pincode in line:
                start = max(0, index - 4)
                end = min(len(normalized_lines), index + 2)
                return " ".join(normalized_lines[start:end])
    address_markers = ("ADDRESS", "ADDR", "S/O", "D/O", "W/O", "C/O", "FLAT", "ROAD", "MARG", "NAGAR", "PIN")
    selected = [line for line in normalized_lines if any(marker in line for marker in address_markers)]
    return " ".join(selected[:6]) if selected else " ".join(normalized_lines[-6:])


def extract_fields(text: str) -> dict[str, Any]:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    normalized = normalize_text(text)
    pan = PAN_RE.search(normalized)
    pincode = PINCODE_RE.search(normalized)
    dates = [normalize_date(match.group(1)) for match in DATE_RE.finditer(normalized)]
    dates = [date for date in dates if date]
    return {
        "pan": pan.group(0) if pan else None,
        "pincode": pincode.group(0) if pincode else None,
        "dates": dates,
        "pan_name_candidates": extract_pan_name_candidates(lines),
        "address_block": extract_address_block(lines, pincode.group(0) if pincode else None),
        "lines": lines[:80],
        "raw_text": text[:5000],
    }


def score_document(profile: dict[str, Any], document: dict[str, Any], extracted: dict[str, Any], confidence: float) -> dict[str, Any]:
    expected_name = profile["full_name"]
    expected_first = profile.get("first_name") or ""
    expected_middle = profile.get("middle_name") or ""
    expected_last = profile.get("last_name") or ""
    expected_dob = profile["dob"]
    expected_pincode = profile["pincode"]
    expected_address = " ".join(
        str(profile.get(key) or "")
        for key in ["address_line1", "address_line2", "city", "state", "pincode"]
    )
    raw_text = extracted.get("raw_text") or ""
    address_block = extracted.get("address_block") or raw_text
    name_candidates = extracted.get("pan_name_candidates") or []
    best_pan_name = max([ratio(expected_name, candidate) for candidate in name_candidates] or [ratio(expected_name, raw_text)])
    candidate_text = normalize_token(" ".join(name_candidates) or raw_text)
    pan_expected_last4 = profile["pan_last4"]
    pan_expected_hash = profile.get("pan_hash")
    pan_extracted = extracted.get("pan")
    first_exact = normalize_token(expected_first) in candidate_text if expected_first else True
    middle_exact = normalize_token(expected_middle) in candidate_text if expected_middle else True
    last_exact = normalize_token(expected_last) in candidate_text if expected_last else True
    pan_hash_exact = bool(pan_extracted and pan_expected_hash and hash_sensitive_value(str(pan_extracted)) == pan_expected_hash)

    hard_failures = []
    scores = {
        "ocr_confidence": confidence,
        "name": best_pan_name if document["document_type"] == "pan" else ratio(expected_name, raw_text),
        "first_name_exact": first_exact,
        "middle_name_exact": middle_exact,
        "last_name_exact": last_exact,
        "address": ratio(expected_address, address_block),
        "pincode_exact": extracted.get("pincode") == expected_pincode,
        "dob_exact": expected_dob in (extracted.get("dates") or []),
        "pan_exact": pan_hash_exact,
        "pan_last4_exact": bool(pan_extracted and str(pan_extracted).endswith(pan_expected_last4)),
    }

    if document["document_type"] == "pan" and not scores["pan_exact"]:
        hard_failures.append("PAN did not exactly match entered PAN.")
    if document["document_type"] == "pan" and not scores["dob_exact"]:
        hard_failures.append("Date of birth did not exactly match entered date.")
    if document["document_type"] == "pan" and not (first_exact and middle_exact and last_exact):
        hard_failures.append("PAN name did not match entered first/middle/last name components.")
    if document["document_type"] == "address_proof" and not scores["pincode_exact"]:
        hard_failures.append("Pincode did not exactly match entered pincode.")
    if confidence < 60:
        hard_failures.append("OCR confidence was below threshold.")

    if document["document_type"] == "pan":
        passed = not hard_failures and scores["name"] >= 82
    else:
        passed = not hard_failures and scores["address"] >= 58
    soft_reasons = []
    if document["document_type"] == "pan" and scores["name"] < 82:
        soft_reasons.append("PAN name score below auto-verification threshold.")
    if document["document_type"] == "address_proof" and scores["address"] < 58:
        soft_reasons.append("Address score below auto-verification threshold.")

    return {
        "scores": scores,
        "passed": passed,
        "manual_review_reasons": hard_failures + soft_reasons,
    }


def recompute_profile_status(db: SupabaseRest, profile_id: str) -> None:
    documents = db.get(
        "kyc_documents",
        {
            "select": "id,status,user_id",
            "kyc_profile_id": f"eq.{profile_id}",
        },
    )
    if not documents:
        return
    profiles = db.get(
        "kyc_profiles",
        {
            "select": "id,user_id,email,full_name",
            "id": f"eq.{profile_id}",
            "limit": "1",
        },
    )
    profile = profiles[0] if profiles else {}

    statuses = {doc["status"] for doc in documents}
    user_id = documents[0]["user_id"]
    if statuses <= {"passed"}:
        status = "auto_verified"
        source = "ocr"
        verified_at = utc_now()
        event = "kyc_auto_verified"
    elif "manual_review_required" in statuses or "rejected" in statuses or "needs_resubmission" in statuses:
        status = "manual_review_required"
        source = "ocr"
        verified_at = None
        event = "kyc_manual_review_required"
    else:
        return

    payload: dict[str, Any] = {"status": status, "source": source, "updated_at": utc_now()}
    if verified_at:
        payload["verified_at"] = verified_at
    db.patch("kyc_profiles", {"id": f"eq.{profile_id}"}, payload)
    db.post(
        "kyc_audit_events",
        {
            "user_id": user_id,
            "kyc_profile_id": profile_id,
            "event_type": event,
            "metadata": {"source": "ocr_worker"},
        },
    )
    notify_kyc_status(profile, status)


def process_job(db: SupabaseRest, engine: RapidOCR, job: dict[str, Any]) -> None:
    job_id = job["id"]
    db.patch(
        "kyc_validation_jobs",
        {"id": f"eq.{job_id}", "status": "eq.pending"},
        {
            "status": "processing",
            "locked_at": utc_now(),
            "locked_by": db.config.worker_id,
            "attempts": job.get("attempts", 0) + 1,
        },
    )
    try:
        documents = db.get(
            "kyc_documents",
            {"select": "*", "id": f"eq.{job['document_id']}", "limit": "1"},
        )
        profiles = db.get(
            "kyc_profiles",
            {"select": "*", "id": f"eq.{job['kyc_profile_id']}", "limit": "1"},
        )
        if not documents or not profiles:
            raise RuntimeError("Missing KYC document or profile.")
        document = documents[0]
        profile = profiles[0]
        content = db.download_storage_object(document["storage_bucket"], document["storage_path"])
        image = load_image(content, document["mime_type"])
        text, confidence = run_ocr(engine, image)
        extracted = extract_fields(text)
        decision = score_document(profile, document, extracted, confidence)
        document_status = "passed" if decision["passed"] else "manual_review_required"

        db.patch(
            "kyc_documents",
            {"id": f"eq.{document['id']}"},
            {
                "status": document_status,
                "extracted_fields": extracted,
                "match_scores": decision["scores"],
                "ocr_confidence": confidence,
                "rejection_reason": "; ".join(decision["manual_review_reasons"]) or None,
                "updated_at": utc_now(),
            },
        )
        db.patch(
            "kyc_validation_jobs",
            {"id": f"eq.{job_id}"},
            {
                "status": "completed",
                "result": decision,
                "updated_at": utc_now(),
            },
        )
        db.post(
            "kyc_audit_events",
            {
                "user_id": document["user_id"],
                "kyc_profile_id": profile["id"],
                "document_id": document["id"],
                "event_type": "kyc_ocr_processed",
                "metadata": decision,
            },
        )
        recompute_profile_status(db, profile["id"])
    except Exception as exc:
        db.patch(
            "kyc_validation_jobs",
            {"id": f"eq.{job_id}"},
            {
                "status": "failed",
                "error_message": str(exc),
                "updated_at": utc_now(),
            },
        )
        raise


def load_config() -> SupabaseConfig:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not service_role_key:
        raise RuntimeError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.")
    return SupabaseConfig(
        url=url,
        service_role_key=service_role_key,
        worker_id=os.environ.get("KYC_WORKER_ID", "local-kyc-worker"),
    )


def poll_once(db: SupabaseRest, engine: RapidOCR, limit: int) -> int:
    jobs = db.get(
        "kyc_validation_jobs",
        {
            "select": "*",
            "status": "eq.pending",
            "source": "eq.ocr",
            "order": "created_at.asc",
            "limit": str(limit),
        },
    )
    for job in jobs:
        process_job(db, engine, job)
    return len(jobs)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true", help="Process one batch and exit.")
    parser.add_argument("--limit", type=int, default=5)
    parser.add_argument("--sleep", type=int, default=30)
    args = parser.parse_args()

    db = SupabaseRest(load_config())
    engine = RapidOCR()
    while True:
        count = poll_once(db, engine, args.limit)
        if args.once:
            print(f"Processed {count} KYC validation job(s).")
            return
        time.sleep(args.sleep)


if __name__ == "__main__":
    main()
