import { NextResponse } from "next/server";
import { createCashfreeClient } from "@/lib/cashfree";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CashfreeWebhookObject = {
  type?: string;
  data?: {
    order?: {
      order_id?: string;
      order_amount?: number;
      order_currency?: string;
      order_status?: string;
    };
    payment?: {
      cf_payment_id?: string | number;
      payment_amount?: number;
      payment_currency?: string;
      payment_status?: string;
    };
  };
};

function getWebhookObject(rawBody: string, signature: string | null, timestamp: string | null) {
  const cashfree = createCashfreeClient();
  if (!cashfree || !signature || !timestamp) {
    return null;
  }

  try {
    return cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp).object as CashfreeWebhookObject;
  } catch {
    return null;
  }
}

function isSuccessfulPayment(event: CashfreeWebhookObject) {
  const type = event.type?.toUpperCase();
  const paymentStatus = event.data?.payment?.payment_status?.toUpperCase();
  const orderStatus = event.data?.order?.order_status?.toUpperCase();

  return type === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS" || orderStatus === "PAID";
}

function getAmountInPaise(event: CashfreeWebhookObject) {
  const amount = event.data?.payment?.payment_amount ?? event.data?.order?.order_amount;
  if (typeof amount !== "number") return null;
  return Math.round(amount * 100);
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const event = getWebhookObject(
    rawBody,
    request.headers.get("x-webhook-signature"),
    request.headers.get("x-webhook-timestamp")
  );

  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const orderId = event.data?.order?.order_id;
  const paymentId = event.data?.payment?.cf_payment_id?.toString() ?? null;

  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase admin is not configured" }, { status: 500 });
  }

  const { data: checkout } = await supabase
    .from("checkout_sessions")
    .select("id, user_id, status")
    .eq("cashfree_order_id", orderId)
    .maybeSingle();

  if (!checkout) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await supabase.from("payments").insert({
    user_id: checkout.user_id,
    provider: "cashfree",
    provider_order_id: orderId,
    provider_payment_id: paymentId,
    amount_in_paise: getAmountInPaise(event),
    currency: event.data?.payment?.payment_currency ?? event.data?.order?.order_currency ?? "INR",
    status: event.data?.payment?.payment_status ?? event.type ?? "unknown",
    raw_event: event
  });

  if (!isSuccessfulPayment(event)) {
    return NextResponse.json({ ok: true });
  }

  if (checkout.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
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
    source: "cashfree",
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
      cashfree_payment_id: paymentId,
      updated_at: new Date().toISOString()
    })
    .eq("id", checkout.id);

  return NextResponse.json({ ok: true });
}
