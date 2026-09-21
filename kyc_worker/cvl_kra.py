import base64
import hashlib
import json
import os
from dataclasses import dataclass
from typing import Any
from xml.etree import ElementTree

import requests
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


@dataclass
class CvlKraConfig:
    environment: str
    status_url: str
    login_code: str
    pos_code: str
    password: str
    pass_key: str
    timeout_seconds: int


def load_cvl_kra_config() -> CvlKraConfig:
    login_code = os.environ.get("CVL_KRA_LOGIN_CODE")
    pos_code = os.environ.get("CVL_KRA_POS_CODE")
    password = os.environ.get("CVL_KRA_PASSWORD")
    pass_key = os.environ.get("CVL_KRA_PASS_KEY")
    status_url = os.environ.get("CVL_KRA_STATUS_URL")
    missing = [
        name
        for name, value in {
            "CVL_KRA_LOGIN_CODE": login_code,
            "CVL_KRA_POS_CODE": pos_code,
            "CVL_KRA_PASSWORD": password,
            "CVL_KRA_PASS_KEY": pass_key,
            "CVL_KRA_STATUS_URL": status_url,
        }.items()
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing CVL KRA configuration: {', '.join(missing)}")

    return CvlKraConfig(
        environment=os.environ.get("CVL_KRA_ENV", "production"),
        status_url=str(status_url),
        login_code=str(login_code),
        pos_code=str(pos_code),
        password=str(password),
        pass_key=str(pass_key),
        timeout_seconds=int(os.environ.get("CVL_KRA_TIMEOUT_SECONDS", "30")),
    )


def decrypt_kyc_payload(encrypted_payload: dict[str, Any]) -> dict[str, Any]:
    secret = os.environ.get("KYC_FIELD_ENCRYPTION_KEY")
    if not secret:
        raise RuntimeError("KYC_FIELD_ENCRYPTION_KEY is required to decrypt KRA job payloads.")
    if encrypted_payload.get("alg") != "AES-256-GCM":
        raise RuntimeError("Unsupported encrypted KYC payload algorithm.")

    key = hashlib.sha256(secret.encode("utf-8")).digest()
    aesgcm = AESGCM(key)
    iv = base64.b64decode(str(encrypted_payload["iv"]))
    ciphertext = base64.b64decode(str(encrypted_payload["ciphertext"]))
    tag = base64.b64decode(str(encrypted_payload["tag"]))
    plaintext = aesgcm.decrypt(iv, ciphertext + tag, None)
    return json.loads(plaintext.decode("utf-8"))


def normalize_kra_status(value: Any) -> str:
    return " ".join(str(value or "").upper().replace("_", " ").replace("-", " ").split())


def extract_status(response_payload: dict[str, Any]) -> str:
    candidates = [
        response_payload.get("status"),
        response_payload.get("kra_status"),
        response_payload.get("kyc_status"),
        response_payload.get("result", {}).get("status") if isinstance(response_payload.get("result"), dict) else None,
        response_payload.get("data", {}).get("status") if isinstance(response_payload.get("data"), dict) else None,
        response_payload.get("data", {}).get("kra_status") if isinstance(response_payload.get("data"), dict) else None,
    ]
    for candidate in candidates:
        normalized = normalize_kra_status(candidate)
        if normalized:
            return normalized
    return "UNKNOWN"


def parse_xmlish_response(text: str) -> dict[str, Any]:
    try:
        root = ElementTree.fromstring(text)
    except ElementTree.ParseError:
        return {"raw_response": text}

    parsed: dict[str, Any] = {"raw_response": text}
    for element in root.iter():
        tag = element.tag.split("}", 1)[-1]
        value = (element.text or "").strip()
        if value:
            parsed[tag] = value
            if value.startswith("<"):
                parsed[f"{tag}_parsed"] = parse_xmlish_response(value)
    return parsed


def call_cvl_kra_status(payload: dict[str, Any], config: CvlKraConfig | None = None) -> dict[str, Any]:
    config = config or load_cvl_kra_config()
    request_payload = {
        "panNo": payload["pan"],
        "userName": config.login_code,
        "PosCode": config.pos_code,
        "password": config.password,
        "PassKey": config.pass_key,
    }
    response = requests.post(
        config.status_url,
        data=request_payload,
        headers={
            "content-type": "application/x-www-form-urlencoded",
            "accept": "text/xml, application/xml, */*",
        },
        timeout=config.timeout_seconds,
    )
    response.raise_for_status()
    data = parse_xmlish_response(response.text)
    return {
        "environment": config.environment,
        "status": extract_status(data),
        "response": data,
    }


def classify_kra_status(status: str) -> tuple[str, str | None]:
    normalized = normalize_kra_status(status)
    auto_verified_markers = {
        "VALIDATED",
        "KYC VALIDATED",
        "REGISTERED",
        "KYC REGISTERED",
        "VALID",
        "APPROVED",
    }
    review_markers = {
        "ON HOLD",
        "HOLD",
        "SUSPENDED",
        "REJECTED",
        "NOT AVAILABLE",
        "NOT FOUND",
        "DEACTIVATED",
        "UNDER PROCESS",
        "PENDING",
        "MODIFICATION REQUIRED",
    }
    if normalized in auto_verified_markers:
        return "auto_verified", None
    if normalized in review_markers:
        return "manual_review_required", f"KRA status requires review: {normalized}."
    return "manual_review_required", f"Unrecognized KRA status: {normalized or 'UNKNOWN'}."
