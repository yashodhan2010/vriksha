"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";
import {
  billingCycles,
  formatMoney,
  getStrategyPrice,
  individualFamilyAnnualFeeCapPaise,
  type BillingCycle,
  type ClientType
} from "@/lib/pricing-core";
import { getFamilyMeta, getStrategyFamily } from "@/lib/strategy-taxonomy";

const basketStorageKey = "vriksha-strategy-basket";
const cycleStorageKey = "vriksha-billing-cycle";
const cashfreeCheckoutScript = "https://sdk.cashfree.com/js/v3/cashfree.js";

type CheckoutStatus = "idle" | "creating" | "created" | "payment_open" | "payment_submitted" | "error";

type CashfreeCheckoutResult = {
  error?: {
    code?: string;
    message?: string;
    type?: string;
  };
  redirect?: boolean;
  paymentDetails?: {
    paymentMessage?: string;
  };
};

type CashfreeCheckoutOptions = {
  paymentSessionId: string;
  redirectTarget?: "_modal" | "_self" | "_blank";
};

type CashfreeSdk = {
  checkout: (options: CashfreeCheckoutOptions) => Promise<CashfreeCheckoutResult>;
};

type CheckoutStrategySummary = {
  slug: string;
  name: string;
  subtitle: string;
  labels: string[];
};

type CheckoutBasketItem = {
  strategy: CheckoutStrategySummary;
  price: ReturnType<typeof getStrategyPrice>;
};

type CashfreeFactory = (options: { mode: "sandbox" | "production" }) => CashfreeSdk;

declare global {
  interface Window {
    Cashfree?: CashfreeFactory;
  }
}

function loadCashfreeCheckout() {
  return new Promise<void>((resolve, reject) => {
    if (window.Cashfree) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${cashfreeCheckoutScript}"]`
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Could not load Cashfree Checkout.")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.src = cashfreeCheckoutScript;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Cashfree Checkout."));
    document.body.appendChild(script);
  });
}

function calculateClientBasket(
  strategySlugs: string[],
  billingCycle: BillingCycle,
  catalog: CheckoutStrategySummary[]
) {
  const uniqueSlugs = [...new Set(strategySlugs)];
  const items = uniqueSlugs
    .map((slug) => {
      const strategy = catalog.find((item) => item.slug === slug);
      if (!strategy) return null;

      return {
        strategy,
        price: getStrategyPrice(slug, billingCycle)
      };
    })
    .filter((item): item is CheckoutBasketItem => Boolean(item));

  const subtotalPaise = items.reduce((sum, item) => sum + item.price.amountPaise, 0);

  return {
    items,
    subtotalPaise,
    taxPaise: 0,
    totalPaise: subtotalPaise,
    currency: "INR"
  };
}

export function CheckoutClient({ catalog }: { catalog: CheckoutStrategySummary[] }) {
  const [basket, setBasket] = useState<string[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [clientType, setClientType] = useState<ClientType>("individual");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [feeCapAcknowledged, setFeeCapAcknowledged] = useState(false);
  const [status, setStatus] = useState<CheckoutStatus>("idle");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const parsed = JSON.parse(window.localStorage.getItem(basketStorageKey) ?? "[]") as unknown;
    if (Array.isArray(parsed)) {
      setBasket(parsed.filter((item): item is string => typeof item === "string"));
    }

    const savedCycle = window.localStorage.getItem(cycleStorageKey);
    if (savedCycle === "monthly" || savedCycle === "quarterly" || savedCycle === "annual") {
      setBillingCycle(savedCycle);
    }
  }, []);

  const basketDetails = useMemo(
    () => calculateClientBasket(basket, billingCycle, catalog),
    [basket, billingCycle, catalog]
  );
  const groupedBasket = basketDetails.items.reduce<Array<{ family: ReturnType<typeof getFamilyMeta>; items: CheckoutBasketItem[] }>>(
    (groups, item) => {
      const family = getFamilyMeta(getStrategyFamily(item.strategy));
      const existing = groups.find((group) => group.family.id === family.id);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ family, items: [item] });
      }
      return groups;
    },
    []
  );

  const annualizedTotal =
    billingCycle === "monthly"
      ? basketDetails.totalPaise * 12
      : billingCycle === "quarterly"
        ? basketDetails.totalPaise * 4
        : basketDetails.totalPaise;

  const feeCapRelevant = clientType === "individual" || clientType === "huf";
  const exceedsFeeCap = feeCapRelevant && annualizedTotal > individualFamilyAnnualFeeCapPaise;
  const canCheckout =
    basketDetails.items.length > 0 &&
    termsAccepted &&
    feeCapAcknowledged &&
    !exceedsFeeCap &&
    status !== "creating" &&
    status !== "payment_open" &&
    status !== "payment_submitted";

  function remove(slug: string) {
    const nextBasket = basket.filter((item) => item !== slug);
    setBasket(nextBasket);
    window.localStorage.setItem(basketStorageKey, JSON.stringify(nextBasket));
  }

  function updateCycle(value: BillingCycle) {
    setBillingCycle(value);
    window.localStorage.setItem(cycleStorageKey, value);
  }

  async function createCheckout() {
    setStatus("creating");
    setNotice("");

    const response = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        strategySlugs: basket,
        billingCycle,
        clientType,
        termsAccepted,
        feeCapAcknowledged
      })
    });

    const payload = (await response.json().catch(() => null)) as {
      error?: string;
      checkoutId?: string;
      amountPaise?: number;
      currency?: string;
      paymentSessionId?: string | null;
      cashfreeOrderId?: string | null;
      cashfreeMode?: "sandbox" | "production";
      mode?: string;
      reason?: string;
    } | null;

    if (!response.ok) {
      setStatus("error");
      setNotice(payload?.error ?? "Could not create checkout.");
      return;
    }

    if (!payload?.paymentSessionId) {
      setStatus("created");
      setNotice(
        payload?.reason === "customer_phone_required"
          ? "Checkout request received, but Cashfree needs a valid 10-digit mobile number before online payment. We can confirm this manually."
          : "Checkout request received. Cashfree keys are not configured yet, so payment will be confirmed manually."
      );
      return;
    }

    try {
      await loadCashfreeCheckout();
    } catch (error) {
      setStatus("error");
      setNotice(error instanceof Error ? error.message : "Could not load Cashfree Checkout.");
      return;
    }

    if (!window.Cashfree) {
      setStatus("error");
      setNotice("Cashfree Checkout is unavailable. Please try again.");
      return;
    }

    setStatus("payment_open");
    setNotice("Opening secure Cashfree checkout.");

    const cashfree = window.Cashfree({
      mode: payload.cashfreeMode ?? "sandbox"
    });

    const result = await cashfree.checkout({
      paymentSessionId: payload.paymentSessionId,
      redirectTarget: "_modal"
    }).catch((failure: { error?: { message?: string } }) => {
      setStatus("error");
      setNotice(failure.error?.message ?? "Payment failed. Please try again or use another payment method.");
      return null;
    });

    if (!result) return;

    if (result.error) {
      setStatus("error");
      setNotice(result.error.message ?? "Payment failed. Please try again or use another payment method.");
      return;
    }

    setStatus("payment_submitted");
    setNotice("Payment submitted. Subscriber access will unlock after Cashfree confirms the payment.");
    window.localStorage.removeItem(basketStorageKey);
    setBasket([]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Subscription Basket</h1>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              Select one or more research strategies. Payment unlocks subscriber access strategy by
              strategy after webhook confirmation.
            </p>
          </div>
          <Link href="/strategies" className="w-fit rounded border border-line px-4 py-2 text-sm font-semibold">
            Add strategies
          </Link>
        </div>

        <div className="mt-6 grid gap-3">
          {basketDetails.items.length === 0 ? (
            <div className="rounded border border-line bg-white p-5 text-sm text-ink/68">
              Your basket is empty.
            </div>
          ) : (
            groupedBasket.map(({ family, items }) => (
              <section className="grid gap-3" key={family.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-clay">{family.signal}</p>
                    <h2 className="font-semibold">{family.label}</h2>
                  </div>
                  <p className="text-xs text-ink/52">{items.length} selected</p>
                </div>
                {items.map(({ strategy, price }) => (
                  <article className="rounded border border-line bg-white p-4" key={strategy.slug}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{strategy.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-ink/62">{strategy.subtitle}</p>
                        <p className="mt-2 text-xs text-ink/52">{price.accessDays} days access</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatMoney(price.amountPaise)}</p>
                        <button
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-clay"
                          type="button"
                          onClick={() => remove(strategy.slug)}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            ))
          )}
        </div>
      </section>

      <aside className="card-accent-ink p-6">
        <h2 className="text-xl font-semibold">Checkout Summary</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Billing cycle
            <select
              className="rounded border border-line bg-white px-3 py-2 font-normal"
              value={billingCycle}
              onChange={(event) => updateCycle(event.target.value as BillingCycle)}
            >
              {billingCycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>{cycle.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Client type
            <select
              className="rounded border border-line bg-white px-3 py-2 font-normal"
              value={clientType}
              onChange={(event) => setClientType(event.target.value as ClientType)}
            >
              <option value="individual">Individual</option>
              <option value="huf">HUF</option>
              <option value="non_individual">Non-individual</option>
              <option value="accredited_investor">Accredited investor</option>
            </select>
          </label>
        </div>

        <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><strong>{formatMoney(basketDetails.subtotalPaise)}</strong></p>
          <p className="flex justify-between"><span>Tax</span><strong>{formatMoney(basketDetails.taxPaise)}</strong></p>
          <p className="flex justify-between text-base"><span>Total</span><strong>{formatMoney(basketDetails.totalPaise)}</strong></p>
          <p className="text-xs leading-5 text-ink/58">
            Annualized fee for cap check: {formatMoney(annualizedTotal)}
          </p>
        </div>

        {exceedsFeeCap && (
          <div className="mt-4 flex gap-3 rounded border border-clay/30 bg-clay/8 p-3 text-sm leading-6 text-clay">
            <AlertTriangle className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            Individual/HUF fee exceeds the current fee cap of {formatMoney(individualFamilyAnnualFeeCapPaise)} per annum per family.
          </div>
        )}

        <div className="mt-5 space-y-3 text-sm leading-6">
          <label className="flex items-start gap-3">
            <input
              className="mt-1 h-4 w-4 accent-pine"
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
            />
            <span>
              I accept the research subscription terms, refund/termination policy, and understand
              that Vriksha does not execute trades on my behalf.
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              className="mt-1 h-4 w-4 accent-pine"
              type="checkbox"
              checked={feeCapAcknowledged}
              onChange={(event) => setFeeCapAcknowledged(event.target.checked)}
            />
            <span>
              I acknowledge the applicable SEBI/RAASB fee-limit framework and that research
              services do not assure returns.
            </span>
          </label>
        </div>

        <button
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded bg-pine px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          disabled={!canCheckout}
          onClick={createCheckout}
        >
          <ShieldCheck size={16} aria-hidden="true" />
          {status === "creating" || status === "payment_open" ? "Opening payment" : "Pay with Cashfree"}
        </button>
        {notice && (
          <p className={`mt-3 text-sm leading-6 ${status === "error" ? "text-clay" : "text-pine"}`}>
            {notice}
          </p>
        )}
      </aside>
    </div>
  );
}
