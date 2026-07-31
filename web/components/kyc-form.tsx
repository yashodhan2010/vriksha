"use client";

import { useState } from "react";
import { CheckCircle2, FileUp, ShieldCheck } from "lucide-react";
import type { KycStatus } from "@/lib/kyc";

type SubmitStatus = "idle" | "submitting" | "submitted" | "error";

export function KycForm({ initialStatus }: { initialStatus?: KycStatus | null }) {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setNotice("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("dependentFamilyDeclaration", formData.get("dependentFamilyDeclaration") ? "true" : "false");
    formData.set("consentAccepted", formData.get("consentAccepted") ? "true" : "false");

    const response = await fetch("/api/kyc/submit", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus("error");
      setNotice(payload?.error ?? "Could not submit KYC. Please try again.");
      return;
    }

    form.reset();
    setStatus("submitted");
    setNotice("KYC submitted. The OCR validation worker will process the documents and route only exceptions to review.");
  }

  return (
    <form className="mt-8 grid gap-6" onSubmit={submit}>
      {initialStatus && (
        <div className="rounded border border-line bg-white p-4 text-sm leading-6 text-ink/68">
          Current KYC status: <strong className="text-ink">{initialStatus.replaceAll("_", " ")}</strong>
        </div>
      )}

      <section className="card p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShieldCheck size={18} aria-hidden="true" />
          Client Details
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            Client type
            <select className="rounded border border-line bg-white px-3 py-2 font-normal" name="clientType" required>
              <option value="individual">Individual</option>
              <option value="huf">HUF</option>
              <option value="non_individual">Non-individual</option>
              <option value="accredited_investor">Accredited investor</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            First name
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="firstName" autoComplete="given-name" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Middle name
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="middleName" autoComplete="additional-name" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Last name
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="lastName" autoComplete="family-name" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            PAN
            <input className="rounded border border-line bg-white px-3 py-2 font-normal uppercase" name="pan" minLength={10} maxLength={10} required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Date of birth / incorporation
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="dob" type="date" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Mobile
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="mobile" autoComplete="tel" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Email
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="email" type="email" autoComplete="email" required />
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Address</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Address line 1
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="addressLine1" autoComplete="address-line1" required />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2">
            Address line 2
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="addressLine2" autoComplete="address-line2" />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            City
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="city" autoComplete="address-level2" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            State
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="state" autoComplete="address-level1" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Pincode
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="pincode" inputMode="numeric" minLength={6} maxLength={6} autoComplete="postal-code" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Family group name
            <input className="rounded border border-line bg-white px-3 py-2 font-normal" name="familyGroupName" />
          </label>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <FileUp size={18} aria-hidden="true" />
          Documents
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            PAN document
            <input className="rounded border border-line bg-white px-3 py-2 font-normal file:mr-3 file:rounded file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-sm" name="panDocument" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Address proof
            <input className="rounded border border-line bg-white px-3 py-2 font-normal file:mr-3 file:rounded file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-sm" name="addressDocument" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required />
          </label>
        </div>
        <div className="mt-5 grid gap-3 text-sm leading-6 text-ink/72">
          <label className="flex items-start gap-3">
            <input className="mt-1 h-4 w-4 accent-pine" name="dependentFamilyDeclaration" type="checkbox" />
            <span>I confirm this subscription should be considered under the same family/dependent fee-cap declaration where applicable.</span>
          </label>
          <label className="flex items-start gap-3">
            <input className="mt-1 h-4 w-4 accent-pine" name="consentAccepted" type="checkbox" required />
            <span>I consent to Vriksha storing KYC data/documents for client onboarding, regulatory records, audit, and verification workflows.</span>
          </label>
        </div>
      </section>

      <button
        className="inline-flex w-fit items-center gap-2 rounded bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={status === "submitting"}
      >
        <CheckCircle2 size={16} aria-hidden="true" />
        {status === "submitting" ? "Submitting KYC" : "Submit KYC"}
      </button>

      {notice && (
        <p className={`text-sm leading-6 ${status === "error" ? "text-clay" : "text-pine"}`}>
          {notice}
        </p>
      )}
    </form>
  );
}
