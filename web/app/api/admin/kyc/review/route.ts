import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, isAdmin } from "@/lib/access";
import { sendKycStatusEmail } from "@/lib/kyc-notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const reviewSchema = z.object({
  profileId: z.string().uuid(),
  decision: z.enum(["verified", "rejected", "needs_resubmission"]),
  note: z.string().max(1000).optional()
});

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const adminUser = await getCurrentUser();
  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Admin storage is not configured." }, { status: 500 });
  }

  const verifiedAt = parsed.data.decision === "verified" ? new Date().toISOString() : null;
  const { data: profile, error: profileError } = await supabase
    .from("kyc_profiles")
    .update({
      status: parsed.data.decision,
      source: "hitl",
      verified_at: verifiedAt,
      reviewed_by: adminUser?.id ?? null,
      review_note: parsed.data.note?.trim() || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.profileId)
    .select("id, user_id, email, full_name")
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Could not update KYC review." }, { status: 500 });
  }

  const headerStore = await headers();
  await supabase.from("kyc_audit_events").insert({
    user_id: profile.user_id,
    kyc_profile_id: profile.id,
    actor_user_id: adminUser?.id ?? null,
    event_type: `kyc_hitl_${parsed.data.decision}`,
    metadata: {
      note: parsed.data.note?.trim() || null,
      ip_address: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      user_agent: headerStore.get("user-agent")
    }
  });

  await sendKycStatusEmail({
    to: profile.email,
    fullName: profile.full_name,
    status: parsed.data.decision,
    note: parsed.data.note?.trim() || null
  });

  return NextResponse.json({ ok: true });
}
