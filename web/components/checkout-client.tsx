"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Trash2 } from "lucide-react";
import {
  billingCycles,
  calculateBasket,
  formatMoney,
  individualFamilyAnnualFeeCapPaise,
  type BillingCycle,
  type ClientType
} from "@/lib/pricing";

const basketStorageKey = "vriksha-strategy-basket";
const cycleStorageKey = "vriksha-billing-cycle";

export function CheckoutClient() {
  const [basket, setBasket] = useState<string[]>([]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [clientType, setClientType] = useState<ClientType>("individual");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [feeCapAcknowledged, setFeeCapAcknowledged] = useState(false);
  const [status, setStatus] = useState<"idle" | "creating" | "created" | "error">("idle");
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
    () => calculateBasket(basket, billingCycle),
    [basket, billingCycle]
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
    status !== "creating";

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
      razorpayOrderId?: string | null;
      mode?: string;
    } | null;

    if (!response.ok) {
      setStatus("error");
      setNotice(payload?.error ?? "Could not create checkout.");
      return;
    }

    setStatus("created");
    setNotice(
      payload?.razorpayOrderId
        ? "Payment session created. Continue to complete payment."
        : "Checkout request received. We will confirm payment instructions shortly."
    );
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
            basketDetails.items.map(({ strategy, price }) => (
              <article className="rounded border border-line bg-white p-4" key={strategy.slug}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{strategy.name}</h2>
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
          {status === "creating" ? "Creating checkout" : "Create payment"}
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
