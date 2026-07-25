import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function verifySignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        currency?: string;
        status?: string;
      };
    };
    order?: {
      entity?: {
        id?: string;
        status?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifySignature(rawBody, request.headers.get("x-razorpay-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  const orderId = event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id;
  const paymentId = event.payload?.payment?.entity?.id ?? null;

  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin is not configured" }, { status: 500 });
  }

  const { data: checkout } = await supabase
    .from("checkout_sessions")
    .select("id, user_id, status, billing_cycle")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (!checkout) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await supabase.from("payments").insert({
    user_id: checkout.user_id,
    provider: "razorpay",
    provider_order_id: orderId,
    provider_payment_id: paymentId,
    amount_in_paise: event.payload?.payment?.entity?.amount ?? null,
    currency: event.payload?.payment?.entity?.currency ?? "INR",
    status: event.event ?? "unknown",
    raw_event: event
  });

  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return NextResponse.json({ ok: true });
  }

  const { data: items } = await supabase
    .from("checkout_items")
    .select("strategy_slug, access_days")
    .eq("checkout_session_id", checkout.id);

  const now = new Date();
  const subscriptions = (items ?? []).map((item) => ({
    user_id: checkout.user_id,
    strategy_slug: item.strategy_slug,
    status: "active",
    source: "razorpay",
    starts_at: now.toISOString(),
    ends_at: new Date(now.getTime() + item.access_days * 24 * 60 * 60 * 1000).toISOString()
  }));

  if (subscriptions.length > 0) {
    await supabase.from("subscriptions").insert(subscriptions);
  }

  await supabase
    .from("checkout_sessions")
    .update({
      status: "paid",
      razorpay_payment_id: paymentId,
      updated_at: new Date().toISOString()
    })
    .eq("id", checkout.id);

  return NextResponse.json({ ok: true });
}

