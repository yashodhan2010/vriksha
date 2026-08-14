"use client";

import { Check, ChevronDown, Download, Eye, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { trackEvent } from "@/lib/analytics";
import type { DashboardStrategy } from "@/lib/dashboard";
import {
  buildRebalanceReviewModel,
  formatPercentagePointChange,
  getReviewProgress,
  type RebalanceClassification,
  type RebalanceReviewItem,
  type RebalanceReviewModel
} from "@/lib/rebalance-review";

function formatDashboardDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatWeight(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

type RebalanceView = "guided" | "comparison" | "full";

const views: Array<{ id: RebalanceView; label: string }> = [
  { id: "guided", label: "Guided changes" },
  { id: "comparison", label: "Allocation comparison" },
  { id: "full", label: "Full portfolio" }
];

const classificationLabels: Record<RebalanceClassification, string> = {
  EXITED: "Exited",
  REDUCED: "Reduced",
  ADDED: "Added",
  INCREASED: "Increased",
  UNCHANGED: "Unchanged",
  INITIAL: "Initial publication"
};

const sectionCopy: Record<RebalanceClassification, { title: string; text: string; tone: string }> = {
  EXITED: {
    title: "Exits",
    text: "Removed from the new model portfolio.",
    tone: "border-clay/30 bg-clay/10 text-clay"
  },
  REDUCED: {
    title: "Reductions",
    text: "Retained at a lower target weight.",
    tone: "border-gold/35 bg-gold/10 text-ink"
  },
  ADDED: {
    title: "New additions",
    text: "Newly introduced to the model portfolio.",
    tone: "border-pine/25 bg-pine/10 text-pine"
  },
  INCREASED: {
    title: "Increases",
    text: "Retained at a higher target weight.",
    tone: "border-sky bg-sky/55 text-ink"
  },
  UNCHANGED: {
    title: "No action required",
    text: "No target-weight change.",
    tone: "border-line bg-white text-ink/68"
  },
  INITIAL: {
    title: "Initial model portfolio",
    text: "First published model portfolio view.",
    tone: "border-pine/25 bg-pine/10 text-pine"
  }
};

const order: RebalanceClassification[] = ["EXITED", "REDUCED", "ADDED", "INCREASED"];

export function RebalanceReviewWorkflow({
  item,
  initialView,
  reviewCsvHref
}: {
  item: DashboardStrategy;
  initialView: RebalanceView;
  reviewCsvHref?: string;
}) {
  const model = useMemo(
    () => item.latestRebalance ? buildRebalanceReviewModel(item.strategy, item.latestRebalance) : null,
    [item.latestRebalance, item.strategy]
  );
  const [activeView, setActiveView] = useState<RebalanceView>(initialView);
  const [reviewedIds, setReviewedIds] = useState(() => item.reviewedChangeIds);
  const [visitedViews, setVisitedViews] = useState(() => new Set<RebalanceView>(item.visitedViews as RebalanceView[]));
  const [reviewedAt, setReviewedAt] = useState(item.reviewedAt);
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!model) {
    return (
      <section className="card p-5">
        <h2 className="text-2xl font-semibold">Rebalance data still processing</h2>
        <p className="mt-2 text-sm leading-6 text-ink/68">
          A published rebalance log is not available for this strategy yet.
        </p>
      </section>
    );
  }

  const reviewModel = model;
  const progress = getReviewProgress(reviewedIds, reviewModel.changedItems);
  const changedCount = reviewModel.changedItems.length;

  function persist(nextReviewedIds: string[], nextVisitedViews: Set<RebalanceView>, nextReviewedAtValue: string | null) {
    setSaveError("");
    startTransition(async () => {
      const response = await fetch("/api/rebalance-reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategySlug: item.strategy.slug,
          rebalanceDate: reviewModel.rebalanceDate,
          reviewedChangeIds: nextReviewedIds,
          visitedViews: Array.from(nextVisitedViews),
          reviewedAt: nextReviewedAtValue
        })
      });

      if (!response.ok) {
        setSaveError("Review status could not be saved. Please try again.");
        return;
      }

      if (nextReviewedAtValue) {
        trackEvent("rebalance_marked_reviewed", {
          strategySlug: item.strategy.slug,
          source: "dashboard_rebalance_review"
        });
      }
    });
  }

  function changeView(nextView: RebalanceView) {
    const nextVisitedViews = new Set(visitedViews);
    nextVisitedViews.add(nextView);
    setActiveView(nextView);
    setVisitedViews(nextVisitedViews);
    const params = new URLSearchParams(window.location.search);
    params.set("view", nextView);
    params.set("strategy", item.strategy.slug);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    persist(reviewedIds, nextVisitedViews, reviewedAt);
  }

  function setReviewed(id: string, checked: boolean) {
    const nextIds = checked
      ? Array.from(new Set([...reviewedIds, id]))
      : reviewedIds.filter((reviewedId) => reviewedId !== id);
    const nextProgress = getReviewProgress(nextIds, reviewModel.changedItems);
    const completedAt = nextProgress.complete ? new Date().toISOString() : null;
    setReviewedIds(nextIds);
    setReviewedAt(completedAt);
    persist(nextIds, visitedViews, completedAt);
  }

  function markSectionReviewed(items: RebalanceReviewItem[]) {
    const nextIds = Array.from(new Set([...reviewedIds, ...items.map((change) => change.id)]));
    const nextProgress = getReviewProgress(nextIds, reviewModel.changedItems);
    const completedAt = nextProgress.complete ? new Date().toISOString() : null;
    setReviewedIds(nextIds);
    setReviewedAt(completedAt);
    persist(nextIds, visitedViews, completedAt);
  }

  function markAllReviewed() {
    const allIds = reviewModel.changedItems.map((change) => change.id);
    const completedAt = new Date().toISOString();
    setReviewedIds(allIds);
    setReviewedAt(completedAt);
    persist(allIds, new Set(["guided", "comparison", "full"]), completedAt);
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded border border-pine/18 bg-[#fffaf4] p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute right-6 top-6 h-20 w-20 rounded-[100%_0_100%_0] border border-gold/25" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">{item.family} {item.edition}</p>
            <h2 className="mt-2 text-3xl font-semibold">{item.strategy.name} Rebalance</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              Published {formatDashboardDate(model.rebalanceDate)} · {model.version}
            </p>
            <p className="mt-3 rounded border border-gold/35 bg-gold/10 p-3 text-sm leading-6 text-ink/72">
              Changes shown are updates to the published model portfolio. Execution remains
              client-directed and is not performed or verified by Vriksha.
            </p>
          </div>
          <div className="relative grid gap-2 text-sm sm:min-w-[280px]">
            <HeaderLine label="Previous model" value={formatDashboardDate(model.previousModelDate) || "Not available"} />
            <HeaderLine label="New model" value={formatDashboardDate(model.newModelDate)} />
            <HeaderLine label="Review status" value={reviewedAt ? "Rebalance reviewed" : "Review pending"} />
            {reviewCsvHref && (
              <a className="btn-secondary mt-2" download href={reviewCsvHref}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Download rebalance CSV
              </a>
            )}
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCell label="Additions" value={model.counts.ADDED} />
          <SummaryCell label="Exits" value={model.counts.EXITED} />
          <SummaryCell label="Increases" value={model.counts.INCREASED} />
          <SummaryCell label="Reductions" value={model.counts.REDUCED} />
          <SummaryCell label="Unchanged" value={model.counts.UNCHANGED} />
        </div>
        <div className="mt-5 rounded border border-line bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {progress.reviewedCount} of {progress.totalCount} model changes reviewed
              </p>
              <p className="mt-1 text-sm text-ink/62">
                Review status does not represent trade execution or broker verification.
              </p>
            </div>
            <button className="btn-secondary" disabled={progress.complete || changedCount === 0 || isPending} onClick={markAllReviewed} type="button">
              <Check className="h-4 w-4" aria-hidden="true" />
              Mark rebalance reviewed
            </button>
          </div>
          <div className="mt-3 h-2 rounded-full bg-line" aria-label={`${progress.percent}% reviewed`} role="progressbar" aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress.percent}>
            <div className="h-2 rounded-full bg-pine" style={{ width: `${progress.percent}%` }} />
          </div>
          {reviewedAt && (
            <p className="mt-3 rounded border border-pine/20 bg-pine/10 p-3 text-sm leading-6 text-ink/72">
              You reviewed all {progress.totalCount} changes in this published model portfolio.
              {" "}Vriksha has not executed or verified any transactions.
            </p>
          )}
          {saveError && <p className="mt-3 text-sm font-semibold text-clay">{saveError}</p>}
        </div>
      </section>

      <div role="tablist" aria-label="Rebalance review views" className="flex gap-2 overflow-x-auto rounded border border-line bg-white p-2">
        {views.map((view) => (
          <button
            aria-controls={`rebalance-${view.id}`}
            aria-selected={activeView === view.id}
            className={`shrink-0 rounded px-4 py-2 text-sm font-semibold ${
              activeView === view.id ? "bg-pine text-white" : "text-ink/68 hover:bg-paper hover:text-ink"
            }`}
            id={`tab-${view.id}`}
            key={view.id}
            onClick={() => changeView(view.id)}
            role="tab"
            type="button"
          >
            {view.label}
          </button>
        ))}
      </div>

      <section aria-labelledby={`tab-${activeView}`} id={`rebalance-${activeView}`} role="tabpanel">
        {activeView === "guided" && (
          <GuidedView
            model={model}
            reviewedIds={reviewedIds}
            onMarkSection={markSectionReviewed}
            onReviewedChange={setReviewed}
            portfolioHref={`/dashboard/portfolio?strategy=${item.strategy.slug}`}
          />
        )}
        {activeView === "comparison" && <ComparisonView model={model} />}
        {activeView === "full" && <FullPortfolioView model={model} reviewedIds={reviewedIds} onReviewedChange={setReviewed} />}
      </section>
    </div>
  );
}

function GuidedView({
  model,
  reviewedIds,
  onReviewedChange,
  onMarkSection,
  portfolioHref
}: {
  model: RebalanceReviewModel;
  reviewedIds: string[];
  onReviewedChange: (id: string, checked: boolean) => void;
  onMarkSection: (items: RebalanceReviewItem[]) => void;
  portfolioHref: string;
}) {
  if (model.isInitialPublication) {
    return (
      <section className="card p-5">
        <h2 className="text-2xl font-semibold">Initial model portfolio published</h2>
        <p className="mt-2 text-sm leading-6 text-ink/68">
          This is the first available model portfolio publication for this strategy.
        </p>
        <ResultingPortfolio model={model} portfolioHref={portfolioHref} />
      </section>
    );
  }

  if (model.changedItems.length === 0) {
    return (
      <section className="card p-5">
        <h2 className="text-2xl font-semibold">No model allocation changes</h2>
        <p className="mt-2 text-sm leading-6 text-ink/68">
          The latest review retained the previous model portfolio without target-weight changes.
        </p>
        <ResultingPortfolio model={model} portfolioHref={portfolioHref} />
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {order.map((classification) => {
        const items = model.items.filter((item) => item.classification === classification);
        if (items.length === 0) return null;
        return (
          <ChangeSection
            classification={classification}
            items={items}
            key={classification}
            onMarkSection={onMarkSection}
            onReviewedChange={onReviewedChange}
            reviewedIds={reviewedIds}
          />
        );
      })}
      {model.unchangedItems.length > 0 && (
        <details className="card p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
            <span>
              <span className="block text-xl font-semibold">No action required</span>
              <span className="mt-1 block text-sm text-ink/62">{model.unchangedItems.length} model holdings remain unchanged</span>
            </span>
            <ChevronDown className="h-5 w-5 text-ink/54" aria-hidden="true" />
          </summary>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {model.unchangedItems.map((change) => (
              <ChangeCard item={change} key={change.id} onReviewedChange={onReviewedChange} reviewed={reviewedIds.includes(change.id)} reviewable={false} />
            ))}
          </div>
        </details>
      )}
      <ResultingPortfolio model={model} portfolioHref={portfolioHref} />
    </div>
  );
}

function ChangeSection({
  classification,
  items,
  reviewedIds,
  onReviewedChange,
  onMarkSection
}: {
  classification: RebalanceClassification;
  items: RebalanceReviewItem[];
  reviewedIds: string[];
  onReviewedChange: (id: string, checked: boolean) => void;
  onMarkSection: (items: RebalanceReviewItem[]) => void;
}) {
  const totalWeight = items.reduce((sum, item) => sum + Math.abs(item.difference), 0);
  const reviewedCount = items.filter((item) => reviewedIds.includes(item.id)).length;
  return (
    <section className="card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Review group</p>
          <h2 className="mt-2 text-2xl font-semibold">{sectionCopy[classification].title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            {sectionCopy[classification].text} {items.length} position{items.length === 1 ? "" : "s"} · {formatWeight(totalWeight)} target weight affected.
          </p>
          <p className="mt-1 text-sm text-ink/54">{reviewedCount} of {items.length} reviewed</p>
        </div>
        <button className="btn-secondary" onClick={() => onMarkSection(items)} type="button">
          Mark section reviewed
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {items.map((change) => (
          <ChangeCard
            item={change}
            key={change.id}
            onReviewedChange={onReviewedChange}
            reviewed={reviewedIds.includes(change.id)}
            reviewable
          />
        ))}
      </div>
    </section>
  );
}

function ComparisonView({ model }: { model: RebalanceReviewModel }) {
  const [sort, setSort] = useState("change");
  const items = [...model.items.filter((item) => item.classification !== "UNCHANGED")].sort((a, b) => {
    if (sort === "symbol") return a.symbol.localeCompare(b.symbol);
    if (sort === "sector") return a.sector.localeCompare(b.sector);
    if (sort === "type") return a.classification.localeCompare(b.classification);
    return Math.abs(b.difference) - Math.abs(a.difference);
  });

  return (
    <section className="card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Allocation comparison</p>
          <h2 className="mt-2 text-2xl font-semibold">Previous versus new target weights</h2>
        </div>
        <label className="inline-flex items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm">
          <SlidersHorizontal className="h-4 w-4 text-ink/54" aria-hidden="true" />
          <span className="sr-only">Sort allocation comparison</span>
          <select className="bg-transparent outline-none" onChange={(event) => setSort(event.target.value)} value={sort}>
            <option value="change">Largest change</option>
            <option value="symbol">Symbol</option>
            <option value="sector">Sector</option>
            <option value="type">Change type</option>
          </select>
        </label>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div className="rounded border border-line bg-white p-4" key={item.id}>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-pine">{item.symbol}</p>
                <p className="text-sm text-ink/62">{item.company} · {item.sector}</p>
              </div>
              <ChangeBadge classification={item.classification} />
            </div>
            <WeightBar label="Previous model" value={item.previousWeight} />
            <WeightBar label="New model" value={item.newWeight} strong />
            <p className="mt-2 text-sm font-semibold text-ink/72">Change {formatPercentagePointChange(item.difference)}</p>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-ink/64">No changed holdings to compare.</p>}
      </div>
    </section>
  );
}

function FullPortfolioView({
  model,
  reviewedIds,
  onReviewedChange
}: {
  model: RebalanceReviewModel;
  reviewedIds: string[];
  onReviewedChange: (id: string, checked: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [classification, setClassification] = useState("ALL");
  const [sector, setSector] = useState("ALL");
  const sectors = Array.from(new Set(model.items.map((item) => item.sector))).sort();
  const filtered = model.items.filter((item) => {
    const haystack = `${item.symbol} ${item.company} ${item.sector}`.toLowerCase();
    return haystack.includes(search.toLowerCase())
      && (classification === "ALL" || item.classification === classification)
      && (sector === "ALL" || item.sector === sector);
  });

  return (
    <section className="card p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay">Full portfolio</p>
          <h2 className="mt-2 text-2xl font-semibold">Complete comparison table</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm">
            <Search className="h-4 w-4 text-ink/54" aria-hidden="true" />
            <span className="sr-only">Search holdings</span>
            <input className="w-40 bg-transparent outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search" value={search} />
          </label>
          <select className="rounded border border-line bg-white px-3 py-2 text-sm" onChange={(event) => setClassification(event.target.value)} value={classification}>
            <option value="ALL">All changes</option>
            {Object.keys(classificationLabels).map((key) => <option key={key} value={key}>{classificationLabels[key as RebalanceClassification]}</option>)}
          </select>
          <select className="rounded border border-line bg-white px-3 py-2 text-sm" onChange={(event) => setSector(event.target.value)} value={sector}>
            <option value="ALL">All sectors</option>
            {sectors.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="sticky top-0 bg-[#fffaf4] text-xs uppercase tracking-[0.14em] text-ink/44">
            <tr>
              <th className="sticky left-0 bg-[#fffaf4] py-2 pr-4 font-medium">Holding</th>
              <th className="font-medium">Sector</th>
              <th className="text-right font-medium">Previous target</th>
              <th className="text-right font-medium">New target</th>
              <th className="text-right font-medium">Change</th>
              <th className="font-medium">Classification</th>
              <th className="font-medium">Review status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr className="border-t border-line align-top" key={item.id}>
                <td className="sticky left-0 bg-[#fffaf4] py-3 pr-4">
                  <p className="font-semibold text-pine">{item.symbol}</p>
                  <p className="text-xs text-ink/54">{item.company}</p>
                </td>
                <td>{item.sector}</td>
                <td className="text-right tabular-nums">{formatWeight(item.previousWeight)}</td>
                <td className="text-right tabular-nums">{formatWeight(item.newWeight)}</td>
                <td className="text-right tabular-nums">{formatPercentagePointChange(item.difference)}</td>
                <td><ChangeBadge classification={item.classification} /></td>
                <td>
                  {item.classification === "UNCHANGED" ? (
                    <span className="text-ink/54">No review required</span>
                  ) : (
                    <ReviewCheckbox checked={reviewedIds.includes(item.id)} id={item.id} onChange={onReviewedChange} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ChangeCard({
  item,
  reviewed,
  reviewable,
  onReviewedChange
}: {
  item: RebalanceReviewItem;
  reviewed: boolean;
  reviewable: boolean;
  onReviewedChange: (id: string, checked: boolean) => void;
}) {
  return (
    <article className="rounded border border-line bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-pine">{item.symbol}</p>
          <p className="mt-1 text-sm text-ink/62">{item.company} · {item.sector}</p>
        </div>
        <ChangeBadge classification={item.classification} />
      </div>
      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <MiniWeight label="Previous model" value={formatWeight(item.previousWeight)} />
        <MiniWeight label="New model" value={formatWeight(item.newWeight)} />
        <MiniWeight label="Change" value={formatPercentagePointChange(item.difference)} />
      </div>
      {item.note && <p className="mt-3 text-sm leading-6 text-ink/58">{item.note}</p>}
      {reviewable && (
        <div className="mt-4">
          <ReviewCheckbox checked={reviewed} id={item.id} onChange={onReviewedChange} />
        </div>
      )}
    </article>
  );
}

function ResultingPortfolio({ model, portfolioHref }: { model: RebalanceReviewModel; portfolioHref: string }) {
  return (
    <section className="mt-5 rounded border border-pine/20 bg-pine/10 p-5">
      <h2 className="text-2xl font-semibold">Resulting model portfolio</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCell label="Version" value={model.version.replace("Model portfolio version ", "")} />
        <SummaryCell label="Effective date" value={formatDashboardDate(model.newModelDate)} />
        <SummaryCell label="Holdings" value={model.items.filter((item) => item.newWeight > 0).length} />
        <SummaryCell label="Total target weight" value={formatWeight(model.totalTargetWeight)} />
      </div>
      {!model.reconciles && (
        <p className="mt-3 rounded border border-clay/30 bg-clay/10 p-3 text-sm font-semibold text-clay">
          Model weights require internal review before this portfolio summary should be relied on.
        </p>
      )}
      <a className="btn-primary mt-4" href={portfolioHref}>
        <Eye className="h-4 w-4" aria-hidden="true" />
        Open complete portfolio
      </a>
    </section>
  );
}

function ReviewCheckbox({
  id,
  checked,
  onChange
}: {
  id: string;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
}) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded border border-line bg-[#fffaf4] px-3 py-2 text-sm font-semibold text-ink/72 hover:border-pine/30">
      <input
        checked={checked}
        className="h-4 w-4 accent-pine"
        onChange={(event) => onChange(id, event.target.checked)}
        type="checkbox"
      />
      {checked ? "Marked as reviewed" : "Mark as reviewed"}
    </label>
  );
}

function ChangeBadge({ classification }: { classification: RebalanceClassification }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${sectionCopy[classification].tone}`}>
      {classificationLabels[classification]}
    </span>
  );
}

function WeightBar({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm">
        <span className="text-ink/62">{label}</span>
        <span className="font-semibold">{formatWeight(value)}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-line">
        <div className={`h-2 rounded-full ${strong ? "bg-pine" : "bg-moss/55"}`} style={{ width: `${Math.min(value * 100, 100)}%` }} />
      </div>
    </div>
  );
}

function HeaderLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded border border-line bg-white px-3 py-2">
      <span className="text-ink/54">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function SummaryCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded border border-line bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/44">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function MiniWeight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-[#fffaf4] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/44">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}
