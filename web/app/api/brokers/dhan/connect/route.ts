import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/access";
import {
  createBrokerState,
  createDhanConsent,
  dhanBrokerId,
  getDhanConsentLoginUrl,
  hashBrokerState
} from "@/lib/brokers/dhan";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const stateCookieName = "vriksha_dhan_connect_state";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Broker connections are not configured" }, { status: 503 });

  const state = createBrokerState();
  const { error } = await supabase.from("broker_connect_sessions").insert({
    user_id: user.id,
    broker: dhanBrokerId,
    state_hash: hashBrokerState(state),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  });
  if (error) return NextResponse.json({ error: "Could not initialise broker connection" }, { status: 500 });

  try {
    const consentId = await createDhanConsent();
    const response = NextResponse.json({ authorizeUrl: getDhanConsentLoginUrl(consentId) });
    response.cookies.set(stateCookieName, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/api/brokers/dhan/callback"
    });
    return response;
  } catch {
    await supabase.from("broker_connect_sessions").delete().eq("state_hash", hashBrokerState(state));
    return NextResponse.json({ error: "Could not start Dhan login" }, { status: 502 });
  }
}
