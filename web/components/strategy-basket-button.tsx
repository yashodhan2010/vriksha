"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { BillingCycle } from "@/lib/pricing";

const storageKey = "vriksha-strategy-basket";
const actionButtonClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition duration-180 hover:border-pine hover:bg-pine hover:text-white active:border-pine active:bg-pine active:text-white focus-visible:border-pine focus-visible:bg-pine focus-visible:text-white";

function readBasket() {
  if (typeof window === "undefined") return [];
  const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "[]") as unknown;
  return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
}

export function StrategyBasketButton({
  slug,
  billingCycle = "monthly",
  label = "Add to basket"
}: {
  slug: string;
  billingCycle?: BillingCycle;
  label?: string;
}) {
  const [added, setAdded] = useState(false);

  function addToBasket(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const basket = readBasket();
    const nextBasket = [...new Set([...basket, slug])];
    window.localStorage.setItem(storageKey, JSON.stringify(nextBasket));
    window.localStorage.setItem("vriksha-billing-cycle", billingCycle);
    window.dispatchEvent(new Event("vriksha:basket-updated"));
    trackEvent("strategy_added_to_basket", {
      strategySlug: slug
    });
    setAdded(true);
  }

  if (added) {
    return (
      <Link
        href="/checkout"
        onClick={(event) => event.stopPropagation()}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-pine bg-pine px-4 py-3 text-sm font-semibold text-white transition duration-180 hover:bg-ink active:bg-ink"
      >
        <ShoppingBasket size={16} aria-hidden="true" />
        View basket
      </Link>
    );
  }

  return (
    <button
      className={actionButtonClass}
      type="button"
      onClick={addToBasket}
    >
      <ShoppingBasket size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
