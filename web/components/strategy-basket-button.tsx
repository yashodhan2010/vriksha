"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import type { BillingCycle } from "@/lib/pricing";

const storageKey = "vriksha-strategy-basket";

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
    setAdded(true);
  }

  if (added) {
    return (
      <Link
        href="/checkout"
        onClick={(event) => event.stopPropagation()}
        className="inline-flex items-center justify-center gap-2 rounded bg-ink px-4 py-3 text-sm font-semibold text-white"
      >
        <ShoppingBasket size={16} aria-hidden="true" />
        View basket
      </Link>
    );
  }

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded bg-pine px-4 py-3 text-sm font-semibold text-white"
      type="button"
      onClick={addToBasket}
    >
      <ShoppingBasket size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
