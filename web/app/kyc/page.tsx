import Link from "next/link";
import { redirect } from "next/navigation";
import { KycForm } from "@/components/kyc-form";
import { getCurrentUser } from "@/lib/access";
import { getLatestKycProfileForUser, isVerifiedKycStatus } from "@/lib/kyc";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type KycDocumentStatus = {
  id: string;
  document_type: string;
  status: string;
  ocr_confidence: number | null;
  rejection_reason: string | null;
};

const statusCopy: Record<string, { title: string; text: string; tone: string }> = {
  queued_for_validation: {
    title: "Verification in progress",
    text: "Your documents are queued for OCR validation. This usually completes automatically once the worker processes the queue.",
    tone: "card-accent-pine"
  },
  ocr_processing: {
    title: "OCR is processing",
    text: "The validation worker is extracting and matching your KYC fields.",
    tone: "card-accent-pine"
  },
  manual_review_required: {
    title: "Compliance review required",
    text: "Your documents need human review because one or more OCR confidence or matching checks did not pass automatically.",
    tone: "card-accent-gold"
  },
  needs_resubmission: {
    title: "Resubmission required",
    text: "Please submit KYC again with clearer documents or corrected details.",
    tone: "card-accent-gold"
  },
  rejected: {
    title: "KYC rejected",
    text: "This submission could not be accepted. Please submit KYC again or contact support.",
    tone: "card"
  },
  submitted: {
    title: "KYC submitted",
    text: "Your KYC details have been received and are waiting for validation.",
    tone: "card-accent-pine"
  }
};

async function getDocuments(profileId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("kyc_documents")
    .select("id, document_type, status, ocr_confidence, rejection_reason")
    .eq("kyc_profile_id", profileId)
    .order("document_type", { ascending: true });

  return (data ?? []) as KycDocumentStatus[];
}

export default async function KycPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/kyc");
  }
  const profile = user ? await getLatestKycProfileForUser(user.id) : null;
  const documents = profile ? await getDocuments(profile.id) : [];
  const currentStatus = profile?.status ?? "not_started";
  const copy = statusCopy[currentStatus] ?? statusCopy.submitted;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Client onboarding</p>
      <h1 className="mt-2 text-3xl font-semibold">KYC Verification</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/68">
        Fee-paying research clients must complete KYC before checkout. Documents are stored in a
        private bucket and routed through OCR matching before any manual compliance review.
      </p>

      {user && isVerifiedKycStatus(profile?.status) && (
        <section className="card-accent-pine mt-8 p-6">
          <h2 className="text-xl font-semibold">KYC verified</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            Your KYC status is verified. Checkout is enabled for paid strategy subscriptions.
            {profile?.verified_at ? ` Verified on ${new Date(profile.verified_at).toLocaleDateString("en-IN")}.` : ""}
          </p>
          <Link href="/checkout" className="mt-4 inline-flex rounded bg-pine px-4 py-2 text-sm font-medium text-white">
            Continue to checkout
          </Link>
        </section>
      )}

      {user && profile && !isVerifiedKycStatus(profile.status) && (
        <section className={`${copy.tone} mt-8 p-6`}>
          <h2 className="text-xl font-semibold">{copy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">{copy.text}</p>
          {profile.review_note && (
            <p className="mt-3 rounded border border-line bg-white p-3 text-sm leading-6 text-ink/72">
              Review note: {profile.review_note}
            </p>
          )}
          {documents.length > 0 && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {documents.map((document) => (
                <div className="rounded border border-line bg-white p-4 text-sm" key={document.id}>
                  <p className="font-semibold">{document.document_type.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-ink/62">
                    {document.status.replaceAll("_", " ")}
                    {document.ocr_confidence ? ` / confidence ${document.ocr_confidence}` : ""}
                  </p>
                  {document.rejection_reason && (
                    <p className="mt-2 text-clay">{document.rejection_reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {(profile.status === "needs_resubmission" || profile.status === "rejected") && (
            <div className="mt-6 border-t border-line pt-6">
              <KycForm initialStatus={profile.status} />
            </div>
          )}
        </section>
      )}

      {user && !profile && (
        <KycForm initialStatus={null} />
      )}
    </main>
  );
}
