import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required before subscribing to blog and information media." }, { status: 401 });
  }

  const payload = {
    user_id: user.id,
    email: user.email ?? "",
    status: "active",
    source: "blog",
    unsubscribed_at: null,
    updated_at: new Date().toISOString()
  };

  const admin = createSupabaseAdminClient();
  const supabase = admin ?? await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Information subscription storage is not configured." }, { status: 500 });
  }

  const { error } = await supabase
    .from("info_subscriptions")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    return NextResponse.json({ error: "Could not activate blog and information-media access." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
