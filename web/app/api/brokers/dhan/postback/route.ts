import { NextRequest, NextResponse } from "next/server";
import { dhanBrokerId, secretsMatch } from "@/lib/brokers/dhan";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DhanPostback = {
  dhanClientId?: string;
  orderId?: string;
  correlationId?: string;
  orderStatus?: string;
  updateTime?: string;
};

export async function POST(request: NextRequest) {
  if (!secretsMatch(request.nextUrl.searchParams.get("key"), process.env.DHAN_POSTBACK_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = await request.json().catch(() => null) as DhanPostback | null;
  if (!event?.dhanClientId || !event.orderId) {
    return NextResponse.json({ error: "Invalid postback payload" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Broker connections are not configured" }, { status: 503 });

  const { data: connection } = await supabase
    .from("broker_connections")
    .select("id")
    .eq("broker", dhanBrokerId)
    .eq("broker_client_id", event.dhanClientId)
    .maybeSingle();
  if (!connection) return NextResponse.json({ ok: true, ignored: true });

  const eventAt = event.updateTime && !Number.isNaN(new Date(event.updateTime).getTime())
    ? new Date(event.updateTime).toISOString()
    : null;
  const { error } = await supabase.from("broker_order_events").upsert(
    {
      broker_connection_id: connection.id,
      broker_order_id: event.orderId,
      correlation_id: event.correlationId ?? null,
      order_status: event.orderStatus ?? null,
      event_at: eventAt,
      raw_event: event
    },
    { onConflict: "broker_connection_id,broker_order_id,order_status,event_at", ignoreDuplicates: true }
  );
  if (error) return NextResponse.json({ error: "Could not record postback" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
