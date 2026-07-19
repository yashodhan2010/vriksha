import Link from "next/link";
import { getStrategy, strategies } from "@/lib/data";
import { hasStrategyAccess } from "@/lib/access";

export default function DashboardPage() {
  const accessible = strategies.filter((strategy) => hasStrategyAccess(strategy.slug));
  const fallback = getStrategy("nifty-quality-momentum");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Subscriber</p>
      <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
      {accessible.length === 0 ? (
        <section className="mt-8 rounded border border-line bg-[#fffaf4] p-6">
          <h2 className="text-xl font-semibold">No active strategy access</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            In production this page will read Supabase Auth plus active subscription/manual grants.
            For local demo, set DEMO_SUBSCRIBED_STRATEGIES={fallback?.slug} in the web environment.
          </p>
          <Link href="/strategies" className="mt-4 inline-flex rounded bg-pine px-4 py-2 text-sm font-medium text-white">
            Browse strategies
          </Link>
        </section>
      ) : (
        <div className="mt-8 grid gap-4">
          {accessible.map((strategy) => (
            <Link className="rounded border border-line bg-[#fffaf4] p-6" href={`/strategies/${strategy.slug}`} key={strategy.slug}>
              <h2 className="text-xl font-semibold">{strategy.name}</h2>
              <p className="mt-2 text-sm text-ink/68">Latest model portfolio and rebalances are available.</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
