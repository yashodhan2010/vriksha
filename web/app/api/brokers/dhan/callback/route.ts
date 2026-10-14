import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/cashfree";
import {
  consumeDhanConsent,
  dhanBrokerId,
  encryptBrokerToken,
  hashBrokerState
} from "@/lib/brokers/dhan";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const stateCookieName = "vriksha_dhan_connect_state";

function redirectWithStatus(request: NextRequest, status: "connected" | "failed") {
  const destination = new URL(`/dashboard?broker_dhan=${status}`, getAppUrl() || request.nextUrl.origin);
  const response = NextResponse.redirect(destination);
  response.cookies.set(stateCookieName, "", { httpOnly: true, maxAge: 0, path: "/api/brokers/dhan/callback" });
  return response;
}

export async function GET(request: NextRequest) {
  const tokenId = request.nextUrl.searchParams.get("tokenId");
  const state = request.cookies.get(stateCookieName)?.value;
  if (!tokenId || !state) return redirectWithStatus(request, "failed");

  const supabase = createSupabaseAdminClient();
  if (!supabase) return redirectWithStatus(request, "failed");

  const stateHash = hashBrokerState(state);
  const { data: session } = await supabase
    .from("broker_connect_sessions")
    .select("id, user_id, expires_at, consumed_at")
    .eq("broker", dhanBrokerId)
    .eq("state_hash", stateHash)
    .maybeSingle();

  if (!session || session.consumed_at || new Date(session.expires_at).getTime() <= Date.now()) {
    return redirectWithStatus(request, "failed");
  }

  try {
    const connection = await consumeDhanConsent(tokenId);
    const { error } = await supabase.from("broker_connections").upsert(
      {
        user_id: session.user_id,
        broker: dhanBrokerId,
        broker_client_id: connection.clientId,
        broker_client_name: connection.clientName,
        broker_client_ucc: connection.clientUcc,
        access_token_ciphertext: encryptBrokerToken(connection.accessToken),
        token_expires_at: connection.expiresAt.toISOString(),
        status: "active",
        metadata: { givenPowerOfAttorney: connection.givenPowerOfAttorney },
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,broker" }
    );
    if (error) throw new Error(error.message);

    await supabase
      .from("broker_connect_sessions")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", session.id)
      .is("consumed_at", null);

    return redirectWithStatus(request, "connected");
  } catch {
    return redirectWithStatus(request, "failed");
  }
}
