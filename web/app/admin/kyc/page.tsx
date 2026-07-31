import Link from "next/link";
import { AdminKycReviewActions } from "@/components/admin-kyc-review-actions";
import { isAdmin } from "@/lib/access";
import { cn } from "@/lib/cn";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type KycDocumentRow = {
  id: string;
  document_type: string;
  storage_bucket: string | null;
  storage_path: string | null;
  original_filename: string | null;
  extracted_fields: Record<string, unknown>;
  match_scores: Record<string, unknown>;
  ocr_confidence: number | null;
  status: string;
  rejection_reason: string | null;
};

type KycProfileRow = {
  id: string;
  user_id: string;
  client_type: string;
  full_name: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  pan_last4: string;
  dob: string;
  mobile: string;
  email: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  status: string;
  source: string;
  review_note: string | null;
  created_at: string;
  kyc_documents: KycDocumentRow[];
};

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="max-h-52 overflow-auto rounded border border-line bg-paper p-3 text-xs leading-5 text-ink/70">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

async function signedDocumentUrl(document: KycDocumentRow) {
  if (!document.storage_bucket || !document.storage_path) return null;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase.storage
    .from(document.storage_bucket)
    .createSignedUrl(document.storage_path, 180);

  return data?.signedUrl ?? null;
}

export default async function AdminKycPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await isAdmin();
  const supabase = createSupabaseAdminClient();
  const profiles: KycProfileRow[] = [];
  const { tab: rawTab } = await searchParams;
  const tab = rawTab && ["queue", "verified", "resubmission", "rejected", "all"].includes(rawTab)
    ? rawTab
    : "queue";
  const statusFilters: Record<string, string[] | null> = {
    queue: ["manual_review_required", "submitted", "queued_for_validation"],
    verified: ["auto_verified", "verified"],
    resubmission: ["needs_resubmission"],
    rejected: ["rejected"],
    all: null
  };
  const tabs = [
    { id: "queue", label: "Review Queue" },
    { id: "verified", label: "Verified" },
    { id: "resubmission", label: "Resubmission" },
    { id: "rejected", label: "Rejected" },
    { id: "all", label: "All" }
  ];

  if (admin && supabase) {
    let query = supabase
      .from("kyc_profiles")
      .select("*, kyc_documents(*)")
      .order("created_at", { ascending: false })
      .limit(50);

    const filter = statusFilters[tab];
    if (filter) {
      query = query.in("status", filter);
    }

    const { data } = await query;
    profiles.push(...((data ?? []) as KycProfileRow[]));
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold">KYC Review Queue</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-ink/68">
        Human review is only for exceptions: OCR mismatch, low confidence, rejected documents, or
        resubmission requests. Document links are short-lived signed URLs.
      </p>

      {!admin && (
        <section className="card mt-8 p-6">
          <h2 className="text-xl font-semibold">Admin access required</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            Set a Supabase profile role to admin, research_analyst, or compliance.
          </p>
        </section>
      )}

      {admin && (
        <nav className="mt-8 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <Link
              className={cn(
                "rounded border border-line px-4 py-2 text-sm font-semibold transition",
                tab === item.id ? "bg-ink text-white" : "bg-white text-ink/72 hover:text-ink"
              )}
              href={`/admin/kyc?tab=${item.id}`}
              key={item.id}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      {admin && profiles.length === 0 && (
        <section className="card mt-8 p-6 text-sm leading-6 text-ink/68">
          No KYC records found for this view.
        </section>
      )}

      {admin && profiles.length > 0 && (
        <div className="mt-8 grid gap-6">
          {await Promise.all(
            profiles.map(async (profile) => (
              <article className="card-accent-ink p-6" key={profile.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/52">
                      {profile.status.replaceAll("_", " ")} / {profile.source}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">{profile.full_name}</h2>
                    <p className="mt-2 text-sm leading-6 text-ink/68">
                      {profile.client_type} / PAN ending {profile.pan_last4} / DOB {profile.dob}
                    </p>
                    <p className="text-sm leading-6 text-ink/68">
                      Name parts: {profile.first_name ?? "-"} / {profile.middle_name ?? "-"} / {profile.last_name ?? "-"}
                    </p>
                    <p className="text-sm leading-6 text-ink/68">
                      {profile.address_line1}
                      {profile.address_line2 ? `, ${profile.address_line2}` : ""}, {profile.city}, {profile.state} - {profile.pincode}
                    </p>
                    <p className="text-sm leading-6 text-ink/68">
                      {profile.email} / {profile.mobile}
                    </p>
                  </div>
                  <Link href={`/admin`} className="w-fit rounded border border-line px-4 py-2 text-sm font-semibold">
                    Admin home
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {await Promise.all(
                    profile.kyc_documents.map(async (document) => {
                      const signedUrl = await signedDocumentUrl(document);
                      return (
                        <section className="rounded border border-line bg-white p-4" key={document.id}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{document.document_type.replaceAll("_", " ")}</h3>
                              <p className="mt-1 text-xs text-ink/52">
                                {document.status.replaceAll("_", " ")} / confidence {document.ocr_confidence ?? "n/a"}
                              </p>
                            </div>
                            {signedUrl && (
                              <a className="rounded bg-ink px-3 py-2 text-xs font-semibold text-white" href={signedUrl} target="_blank" rel="noreferrer">
                                Open document
                              </a>
                            )}
                          </div>
                          {document.rejection_reason && (
                            <p className="mt-3 rounded border border-clay/30 bg-clay/8 p-3 text-sm leading-6 text-clay">
                              {document.rejection_reason}
                            </p>
                          )}
                          <div className="mt-4 grid gap-3">
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/52">Extracted fields</p>
                              <JsonBlock value={document.extracted_fields} />
                            </div>
                            <div>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink/52">Match scores</p>
                              <JsonBlock value={document.match_scores} />
                            </div>
                          </div>
                        </section>
                      );
                    })
                  )}
                </div>

                {["manual_review_required", "submitted", "queued_for_validation"].includes(profile.status) && (
                  <AdminKycReviewActions profileId={profile.id} />
                )}
              </article>
            ))
          )}
        </div>
      )}
    </main>
  );
}
