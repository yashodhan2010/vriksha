import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { getSubscribePath } from "@/lib/data";

function LockedPortfolioPreview() {
  const rows = [
    ["12%", "78%"],
    ["9%", "58%"],
    ["8%", "52%"],
    ["7%", "45%"],
    ["6%", "38%"]
  ];

  return (
    <div className="pointer-events-none select-none grid gap-5 opacity-70 blur-[1.5px] lg:grid-cols-[1.1fr_0.9fr]" aria-hidden="true">
      <div className="rounded border border-line bg-white/85 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-40 rounded-full bg-ink/14" />
          <div className="h-8 w-16 rounded bg-ink/10" />
        </div>
        <div className="space-y-3">
          {rows.map(([weight, width], index) => (
            <div className="grid grid-cols-[70px_1fr_90px] items-center gap-3 border-t border-line pt-3" key={`${weight}-${index}`}>
              <div className="h-3 rounded-full bg-ink/16" />
              <div>
                <div className="h-3 w-36 rounded-full bg-ink/12" />
                <div className="mt-2 h-2 w-24 rounded-full bg-sky/70" />
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                  <span className="block h-full rounded-full bg-pine/45" style={{ width }} />
                </span>
                <span className="h-3 w-7 rounded-full bg-ink/12" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded border border-line bg-white/85 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-36 rounded-full bg-ink/14" />
          <div className="h-8 w-16 rounded bg-ink/10" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div className="rounded border border-line bg-paper p-3" key={item}>
              <div className="h-3 w-28 rounded-full bg-ink/14" />
              <div className="mt-3 h-2 w-full rounded-full bg-ink/10" />
              <div className="mt-2 h-2 w-4/5 rounded-full bg-ink/10" />
              <div className="mt-3 flex gap-2">
                <span className="h-5 w-16 rounded-full bg-moss/20" />
                <span className="h-5 w-16 rounded-full bg-clay/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Paywall({ slug }: { slug: string }) {
  return (
    <section className="overflow-hidden rounded border border-line bg-paper/70 p-4 shadow-sm sm:p-5">
      <div className="rounded border border-line bg-white/95 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-ink text-white">
            <LockKeyhole size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">Subscriber access required</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/68">
              Unlock the latest model portfolio, target weights, CSV exports, and recent rebalance
              notes with an active subscription or manual access grant.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-ink/64">
              <span className="rounded border border-line bg-paper px-3 py-2">Latest holdings and weights</span>
              <span className="rounded border border-line bg-paper px-3 py-2">Recent rebalance trail</span>
              <span className="rounded border border-line bg-paper px-3 py-2">Subscriber CSV exports</span>
            </div>
            <Link
              href={getSubscribePath(slug)}
              className="mt-4 inline-flex rounded bg-pine px-4 py-2 text-sm font-medium text-white"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>
      <div className="relative mt-5 overflow-hidden rounded border border-line bg-white/55 p-4">
        <LockedPortfolioPreview />
        <div className="absolute inset-0 bg-white/52 backdrop-blur-[2px]" aria-hidden="true" />
      </div>
    </section>
  );
}
