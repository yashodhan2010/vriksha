import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/access";
import { triggerKycWorker } from "@/lib/kyc-worker-trigger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const rerunSchema = z.object({
  profileId: z.string().uuid()
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = rerunSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rerun payload." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Admin storage is not configured." }, { status: 500 });
  }

  const { data: documents, error } = await supabase
    .from("kyc_documents")
    .select("id, user_id")
    .eq("kyc_profile_id", parsed.data.profileId);

  if (error || !documents?.length) {
    return NextResponse.json({ error: "No KYC documents found for this profile." }, { status: 404 });
  }

  await supabase
    .from("kyc_profiles")
    .update({
      status: "queued_for_validation",
      source: "manual_upload",
      verified_at: null,
      review_note: null,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.profileId);

  await supabase
    .from("kyc_documents")
    .update({
      status: "queued",
      rejection_reason: null,
      updated_at: new Date().toISOString()
    })
    .eq("kyc_profile_id", parsed.data.profileId);

  await supabase.from("kyc_validation_jobs").insert(
    documents.map((document) => ({
      kyc_profile_id: parsed.data.profileId,
      document_id: document.id,
      source: "ocr",
      status: "pending"
    }))
  );

  await supabase.from("kyc_audit_events").insert({
    user_id: documents[0].user_id,
    kyc_profile_id: parsed.data.profileId,
    event_type: "kyc_ocr_rerun_requested",
    metadata: { document_ids: documents.map((document) => document.id) }
  });

  const workerTrigger = await triggerKycWorker(documents.length);

  return NextResponse.json({ ok: true, workerTrigger });
}
