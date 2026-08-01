import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/access";
import { getStrategy } from "@/lib/data";
import {
  calculateBasket,
  individualFamilyAnnualFeeCapPaise,
  type BillingCycle
} from "@/lib/pricing";
import { getVerifiedKycProfileForUser, kycVersions } from "@/lib/kyc";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const checkoutSchema = z.object({
  strategySlugs: z.array(z.string().min(1).max(120)).min(1).max(20),
  billingCycle: z.enum(["monthly", "quarterly", "annual"]),
  clientType: z.enum(["individual", "huf", "non_individual", "accredited_investor"]),
  termsAccepted: z.literal(true),
  feeCapAcknowledged: z.literal(true)
});

function annualize(totalPaise: number, billingCycle: BillingCycle) {
  if (billingCycle === "monthly") return totalPaise * 12;
  if (billingCycle === "quarterly") return totalPaise * 4;
  return totalPaise;
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required before checkout." }, { status: 401 });
  }

  const verifiedKyc = await getVerifiedKycProfileForUser(user.id);
  if (!verifiedKyc) {
    return NextResponse.json({ error: "Verified KYC is required before checkout." }, { status: 403 });
  }

  const uniqueSlugs = [...new Set(parsed.data.strategySlugs)];
  const unknownSlug = uniqueSlugs.find((slug) => !getStrategy(slug));
  if (unknownSlug) {
    return NextResponse.json({ error: `Unknown strategy: ${unknownSlug}` }, { status: 400 });
  }

  const basket = calculateBasket(uniqueSlugs, parsed.data.billingCycle);
  const feeCapRelevant = parsed.data.clientType === "individual" || parsed.data.clientType === "huf";
  const annualizedTotal = annualize(basket.totalPaise, parsed.data.billingCycle);

  if (feeCapRelevant && annualizedTotal > individualFamilyAnnualFeeCapPaise) {
    return NextResponse.json({ error: "Selected basket exceeds the current individual/HUF fee cap." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Checkout is temporarily unavailable." }, { status: 500 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("checkout_sessions")
    .insert({
      user_id: user.id,
      status: "created",
      client_type: parsed.data.clientType,
      billing_cycle: parsed.data.billingCycle,
      subtotal_paise: basket.subtotalPaise,
      tax_paise: basket.taxPaise,
      total_paise: basket.totalPaise,
      currency: basket.currency,
      kyc_profile_id: verifiedKyc.id,
      kyc_verified_at: verifiedKyc.verified_at ?? new Date().toISOString(),
      terms_version: kycVersions.terms,
      mitc_version: kycVersions.mitc,
      disclaimer_version: "v1",
      fee_cap_acknowledged: true,
      terms_accepted_at: new Date().toISOString(),
      fee_cap_snapshot: {
        client_type: parsed.data.clientType,
        annualized_total_paise: annualizedTotal,
        individual_huf_cap_paise: individualFamilyAnnualFeeCapPaise,
        fee_cap_relevant: feeCapRelevant,
        kyc_profile_id: verifiedKyc.id
      }
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Could not create checkout session." }, { status: 500 });
  }

  const items = basket.items.map(({ strategy, price }) => ({
    checkout_session_id: session.id,
    strategy_slug: strategy.slug,
    strategy_name: strategy.name,
    billing_cycle: parsed.data.billingCycle,
    amount_paise: price.amountPaise,
    access_days: price.accessDays
  }));

  const { error: itemsError } = await supabase.from("checkout_items").insert(items);
  if (itemsError) {
    return NextResponse.json({ error: "Could not create checkout items." }, { status: 500 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({
      ok: true,
      mode: "manual_confirmation",
      checkoutId: session.id,
      amountPaise: basket.totalPaise,
      razorpayOrderId: null
    });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  const order = await razorpay.orders.create({
    amount: basket.totalPaise,
    currency: basket.currency,
    receipt: `checkout_${session.id.slice(0, 24)}`,
    notes: {
      checkout_id: session.id,
      user_id: user.id,
      strategy_slugs: uniqueSlugs.join(","),
      billing_cycle: parsed.data.billingCycle
    }
  });

  await supabase
    .from("checkout_sessions")
    .update({
      status: "payment_pending",
      razorpay_order_id: order.id
    })
    .eq("id", session.id);

  return NextResponse.json({
    ok: true,
    mode: "razorpay_order",
    checkoutId: session.id,
    amountPaise: basket.totalPaise,
    razorpayOrderId: order.id,
    razorpayKeyId: keyId
  });
}
