"use client";

import { useMemo, useState } from "react";
import { Calculator, Download, FileDown, IndianRupee, Sparkles } from "lucide-react";
import type { PortfolioHolding } from "@/lib/types";

type PortfolioAllocationPlannerProps = {
  csvHref?: string;
  holdings: PortfolioHolding[];
  strategyName: string;
  strategySlug: string;
};

type CsvValue = string | number | null | undefined;

const quickAmounts = [100000, 250000, 500000, 1000000];

function parseAmount(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatInr(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits,
    minimumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

function csvEscape(value: CsvValue) {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv(headers: string[], rows: CsvValue[][]) {
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

export function PortfolioAllocationPlanner({
  csvHref,
  holdings,
  strategyName,
  strategySlug
}: PortfolioAllocationPlannerProps) {
  const [amountInput, setAmountInput] = useState("500000");
  const investmentAmount = parseAmount(amountInput);
  const totalWeight = useMemo(() => holdings.reduce((sum, holding) => sum + holding.weight, 0), [holdings]);
  const allocatedAmount = investmentAmount * totalWeight;
  const residualAmount = Math.max(investmentAmount - allocatedAmount, 0);
  const largestHolding = useMemo(
    () => [...holdings].sort((a, b) => b.weight - a.weight)[0],
    [holdings]
  );

  const plannedRows = useMemo(
    () =>
      holdings.map((holding) => ({
        ...holding,
        allocationAmount: investmentAmount * holding.weight
      })),
    [holdings, investmentAmount]
  );

  const downloadAllocationCsv = () => {
    if (investmentAmount <= 0) return;

    const headers = [
      "symbol",
      "company",
      "sector",
      "marketcap",
      "weight",
      "weight_percent",
      "investment_amount",
      "note"
    ];
    const rows = plannedRows.map((holding) => [
      holding.symbol,
      holding.company,
      holding.sector,
      holding.marketcap,
      holding.weight,
      (holding.weight * 100).toFixed(4),
      holding.allocationAmount.toFixed(2),
      holding.note
    ]);

    if (residualAmount > 0.5) {
      rows.push(["CASH", "Unallocated cash", "", "", 1 - totalWeight, ((1 - totalWeight) * 100).toFixed(4), residualAmount.toFixed(2), "Residual allocation"]);
    }

    const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${strategySlug}-allocation-${Math.round(investmentAmount)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded border border-line bg-[#fffaf4] p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-pine">
            <Sparkles size={14} aria-hidden="true" />
            Allocation planner
          </p>
          <h2 className="mt-2 text-xl font-semibold">Latest Model Portfolio</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/62">
            Enter the capital you plan to invest in {strategyName} and export a CSV with the suggested rupee amount for every asset.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {csvHref && (
            <a
              className="inline-flex min-h-10 items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/72 hover:border-pine/40 hover:text-pine"
              href={csvHref}
            >
              <FileDown size={15} aria-hidden="true" />
              Weights CSV
            </a>
          )}
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-pine disabled:cursor-not-allowed disabled:opacity-50"
            disabled={investmentAmount <= 0}
            onClick={downloadAllocationCsv}
            type="button"
          >
            <Download size={15} aria-hidden="true" />
            Allocation CSV
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.3fr)]">
        <div className="rounded border border-pine/15 bg-white p-4">
          <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46" htmlFor="investment-amount">
            Investment amount
          </label>
          <div className="mt-3 flex min-h-12 items-center gap-2 rounded border border-line bg-paper px-3 focus-within:border-pine/50 focus-within:bg-white">
            <IndianRupee size={17} className="shrink-0 text-pine" aria-hidden="true" />
            <input
              className="w-full bg-transparent text-lg font-semibold tabular-nums text-ink outline-none placeholder:text-ink/32"
              id="investment-amount"
              inputMode="decimal"
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="500000"
              value={amountInput}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <button
                className="rounded border border-line bg-[#fffaf4] px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-pine/40 hover:text-pine"
                key={amount}
                onClick={() => setAmountInput(String(amount))}
                type="button"
              >
                {formatInr(amount)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded border border-line bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46">Deployed</p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-ink">{formatInr(allocatedAmount)}</p>
            <p className="mt-1 text-xs text-ink/54">{(totalWeight * 100).toFixed(1)}% of capital</p>
          </div>
          <div className="rounded border border-line bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46">Residual</p>
            <p className="mt-2 text-lg font-semibold tabular-nums text-ink">{formatInr(residualAmount)}</p>
            <p className="mt-1 text-xs text-ink/54">Shown if weights total below 100%</p>
          </div>
          <div className="rounded border border-line bg-white p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/46">Largest line</p>
            <p className="mt-2 truncate text-lg font-semibold text-ink">{largestHolding?.symbol ?? "-"}</p>
            <p className="mt-1 text-xs tabular-nums text-ink/54">
              {largestHolding ? formatInr(investmentAmount * largestHolding.weight) : formatInr(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-pine"
          style={{ width: `${Math.min(totalWeight * 100, 100)}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-ink/52">
            <tr>
              <th className="py-2 font-medium">Symbol</th>
              <th className="font-medium">Company</th>
              <th className="font-medium">Sector</th>
              <th className="font-medium">Weight</th>
              <th className="font-medium">Suggested amount</th>
              <th className="font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {plannedRows.map((holding) => (
              <tr className="border-t border-line transition-colors duration-180 hover:bg-paper" key={holding.symbol}>
                <td className="py-3 font-semibold">{holding.symbol}</td>
                <td>{holding.company}</td>
                <td>
                  <span className="rounded-full bg-sky/60 px-2.5 py-0.5 text-xs font-medium text-ink/72">{holding.sector}</span>
                </td>
                <td>
                  <span className="tabular-nums font-medium">{(holding.weight * 100).toFixed(1)}%</span>
                </td>
                <td>
                  <span className="inline-flex items-center gap-1 rounded bg-pine/10 px-2.5 py-1 font-semibold tabular-nums text-pine">
                    <Calculator size={13} aria-hidden="true" />
                    {formatInr(holding.allocationAmount)}
                  </span>
                </td>
                <td className="text-ink/68">{holding.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-ink/54">
        Allocation amounts are calculated from model weights for convenience. Final order quantities, prices, taxes, and execution remain investor-directed.
      </p>
    </div>
  );
}
