"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RefreshCw, RotateCcw, XCircle } from "lucide-react";

export function AdminKycReviewActions({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function review(decision: "verified" | "rejected" | "needs_resubmission") {
    setStatus("saving");
    setMessage("");
    const response = await fetch("/api/admin/kyc/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, decision, note })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(payload?.error ?? "Could not save review.");
      return;
    }

    setStatus("saved");
    setMessage("Review saved.");
    router.refresh();
  }

  async function rerunOcr() {
    setStatus("saving");
    setMessage("");
    const response = await fetch("/api/admin/kyc/rerun", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setMessage(payload?.error ?? "Could not queue OCR rerun.");
      return;
    }

    setStatus("saved");
    setMessage("OCR rerun queued.");
    router.refresh();
  }

  return (
    <div className="mt-5 grid gap-3">
      <label className="grid gap-2 text-sm font-medium">
        Review note
        <textarea
          className="min-h-24 rounded border border-line bg-white px-3 py-2 font-normal"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Reason for approval, rejection, or resubmission request"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex items-center gap-2 rounded bg-pine px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          type="button"
          disabled={status === "saving" || status === "saved"}
          onClick={() => review("verified")}
        >
          <CheckCircle2 size={15} aria-hidden="true" />
          Approve
        </button>
        <button
          className="inline-flex items-center gap-2 rounded border border-line px-4 py-2 text-sm font-semibold disabled:opacity-60"
          type="button"
          disabled={status === "saving" || status === "saved"}
          onClick={rerunOcr}
        >
          <RefreshCw size={15} aria-hidden="true" />
          Rerun OCR
        </button>
        <button
          className="inline-flex items-center gap-2 rounded border border-line px-4 py-2 text-sm font-semibold disabled:opacity-60"
          type="button"
          disabled={status === "saving" || status === "saved"}
          onClick={() => review("needs_resubmission")}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Resubmission
        </button>
        <button
          className="inline-flex items-center gap-2 rounded border border-clay/30 px-4 py-2 text-sm font-semibold text-clay disabled:opacity-60"
          type="button"
          disabled={status === "saving" || status === "saved"}
          onClick={() => review("rejected")}
        >
          <XCircle size={15} aria-hidden="true" />
          Reject
        </button>
      </div>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-clay" : "text-pine"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
