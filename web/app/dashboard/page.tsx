import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { getStrategyPath, getStrategyPerformancePath, strategies } from "@/lib/data";
import { getCurrentUser, hasStrategyAccess } from "@/lib/access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDate(value: string | null | undefined) {
  if (!value) return "Open-ended";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "NA";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const supabase = user ? await createSupabaseServerClient() : null;

  const [profileResult, subscriptionsResult, grantsResult, kycResult] = user && supabase
    ? await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("strategy_slug, status, starts_at, ends_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("strategy_access_grants")
        .select("strategy_slug, starts_at, ends_at, revoked_at")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("kyc_profiles")
        .select("status, verified_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ])
    : [null, null, null, null];

  const subscriptions = subscriptionsResult?.data ?? [];
  const grants = grantsResult?.data ?? [];
  const profileRole = profileResult?.data?.role ?? "subscriber";
  const latestKyc = kycResult?.data ?? null;
  const now = Date.now();

  const accessPairs = await Promise.all(
    strategies.map(async (strategy) => ({
      strategy,
      canAccess: await hasStrategyAccess(strategy.slug)
    }))
  );
  const accessible = accessPairs.filter((item) => item.canAccess).map((item) => item.strategy);
  const activeSubscriptions = subscriptions.filter((subscription) =>
    ["trialing", "active"].includes(subscription.status)
      && (!subscription.ends_at || new Date(subscription.ends_at).getTime() > now)
  );
  const nearestExpiry = activeSubscriptions
    .filter((subscription) => subscription.ends_at)
    .map((subscription) => new Date(subscription.ends_at as string).getTime())
    .filter((timestamp) => Number.isFinite(timestamp) && timestamp > now)
    .sort((a, b) => a - b)[0];

  const activeGrants = grants.filter((grant) => {
    const startsAt = new Date(grant.starts_at).getTime();
    const endsAt = grant.ends_at ? new Date(grant.ends_at).getTime() : Number.POSITIVE_INFINITY;
    return startsAt <= now && endsAt > now;
  });

  const strategyNameBySlug = new Map(strategies.map((strategy) => [strategy.slug, strategy.name]));

  const accessByStrategy = strategies.map((strategy) => {
    const subscription = activeSubscriptions.find((item) => item.strategy_slug === strategy.slug);
    const grant = activeGrants.find((item) => item.strategy_slug === strategy.slug);
    const canAccess = accessible.some((item) => item.slug === strategy.slug);
    const source = subscription ? "Subscription" : grant ? "Manual grant" : "Locked";

    return {
      strategy,
      canAccess,
      source,
      startsAt: subscription?.starts_at ?? grant?.starts_at ?? null,
      endsAt: subscription?.ends_at ?? grant?.ends_at ?? null
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Subscriber</p>
      <h1 className="mt-2 text-3xl font-semibold">Dashboard</h1>
      {!user && (
        <section className="card mt-8 p-6">
          <h2 className="text-xl font-semibold">Login required</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            Login identifies the viewer. Strategy access is granted separately through a paid
            subscription or manual admin grant.
          </p>
          <Link href="/login?next=/dashboard" className="mt-4 inline-flex rounded bg-ink px-4 py-2 text-sm font-medium text-white">
            Login
          </Link>
        </section>
      )}
      {user && (
        <section className="card mt-8 p-6">
          <h2 className="text-xl font-semibold">Subscriber Info</h2>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <p className="rounded border border-line bg-white p-3">
              <span className="block text-xs uppercase tracking-wide text-ink/52">Email</span>
              <span className="mt-1 block font-medium text-ink">{user.email ?? "NA"}</span>
            </p>
            <p className="rounded border border-line bg-white p-3">
              <span className="block text-xs uppercase tracking-wide text-ink/52">Role</span>
              <span className="mt-1 block font-medium text-ink">{profileRole}</span>
            </p>
            <p className="rounded border border-line bg-white p-3">
              <span className="block text-xs uppercase tracking-wide text-ink/52">KYC status</span>
              <span className="mt-1 block font-medium text-ink">{latestKyc?.status?.replaceAll("_", " ") ?? "not started"}</span>
            </p>
            <p className="rounded border border-line bg-white p-3">
              <span className="block text-xs uppercase tracking-wide text-ink/52">Baskets unlocked</span>
              <span className="mt-1 block font-medium text-ink">{accessible.length}</span>
            </p>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <p className="rounded border border-line bg-white p-3 leading-6 text-ink/72">
              Active subscriptions: <strong className="text-ink">{activeSubscriptions.length}</strong>
            </p>
            <p className="rounded border border-line bg-white p-3 leading-6 text-ink/72">
              Active manual grants: <strong className="text-ink">{activeGrants.length}</strong>
            </p>
            <p className="rounded border border-line bg-white p-3 leading-6 text-ink/72">
              Nearest expiry: <strong className="text-ink">{nearestExpiry ? formatDate(new Date(nearestExpiry).toISOString()) : "No expiry"}</strong>
            </p>
          </div>
        </section>
      )}

      {user && (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link href="/strategies" className="card-interactive p-5">
            <h2 className="text-base font-semibold">Browse Stock Baskets</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">Explore public research and open strategy details.</p>
          </Link>
          <Link href="/kyc" className="card-interactive p-5">
            <h2 className="text-base font-semibold">KYC Status</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">Review verification status and submit updates if required.</p>
          </Link>
          <Link href="/checkout" className="card-interactive p-5">
            <h2 className="text-base font-semibold">Checkout And Billing</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">Start a new subscription once KYC is verified.</p>
          </Link>
          <Link href="/contact" className="card-interactive p-5">
            <h2 className="text-base font-semibold">Support</h2>
            <p className="mt-2 text-sm leading-6 text-ink/68">Need help with access or compliance questions.</p>
          </Link>
        </section>
      )}

      {user && (activeSubscriptions.length > 0 || activeGrants.length > 0) && (
        <section className="card mt-8 p-6">
          <h2 className="text-xl font-semibold">Active Entitlements</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink/52">
                <tr>
                  <th className="py-2 font-medium">Stock basket</th>
                  <th className="font-medium">Source</th>
                  <th className="font-medium">Start</th>
                  <th className="font-medium">End</th>
                  <th className="font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...activeSubscriptions.map((subscription) => ({
                    slug: subscription.strategy_slug,
                    source: "Subscription",
                    startsAt: subscription.starts_at,
                    endsAt: subscription.ends_at
                  })),
                  ...activeGrants.map((grant) => ({
                    slug: grant.strategy_slug,
                    source: "Manual grant",
                    startsAt: grant.starts_at,
                    endsAt: grant.ends_at
                  }))
                ].map((item) => (
                  <tr className="border-t border-line" key={`${item.slug}-${item.source}-${item.startsAt ?? "na"}`}>
                    <td className="py-3 font-medium">{strategyNameBySlug.get(item.slug) ?? item.slug}</td>
                    <td>{item.source}</td>
                    <td>{formatDate(item.startsAt)}</td>
                    <td>{formatDate(item.endsAt)}</td>
                    <td>
                      <Link href={getStrategyPath(item.slug)} className="font-semibold text-pine hover:text-ink">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {user && accessible.length === 0 && (
        <section className="card mt-8 p-6">
          <h2 className="text-xl font-semibold">No active strategy access</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            You do not currently have an active strategy subscription. Choose a strategy to unlock
            the latest model portfolio and rebalance notes.
          </p>
          <Link href="/strategies" className="mt-4 inline-flex rounded bg-pine px-4 py-2 text-sm font-medium text-white">
            Browse strategies
          </Link>
        </section>
      )}
      {accessible.length > 0 && (
        <Reveal className="mt-8 grid gap-4">
          {accessible.map((strategy) => (
            <article className="card p-6" key={strategy.slug}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{strategy.name}</h2>
                  <p className="mt-2 text-sm text-ink/68">Latest model portfolio and recent rebalance trail are available.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link className="inline-flex rounded border border-line px-4 py-2 text-sm font-semibold hover:bg-paper" href={getStrategyPath(strategy)}>
                    Open basket
                  </Link>
                  <Link className="inline-flex rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-pine" href={getStrategyPerformancePath(strategy)}>
                    Backtest performance
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      )}

      {user && (
        <section className="card mt-8 p-6">
          <h2 className="text-xl font-semibold">Access Matrix</h2>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            Track which stock baskets are unlocked through subscription or internal grants.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink/52">
                <tr>
                  <th className="py-2 font-medium">Stock basket</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium">Source</th>
                  <th className="font-medium">Starts</th>
                  <th className="font-medium">Ends</th>
                  <th className="font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessByStrategy.map((item) => (
                  <tr className="border-t border-line" key={item.strategy.slug}>
                    <td className="py-3 font-medium">{item.strategy.name}</td>
                    <td>
                      <span className={`rounded px-2.5 py-1 text-xs font-semibold ${item.canAccess ? "bg-moss/15 text-moss" : "bg-clay/12 text-clay"}`}>
                        {item.canAccess ? "Unlocked" : "Locked"}
                      </span>
                    </td>
                    <td>{item.source}</td>
                    <td>{formatDate(item.startsAt)}</td>
                    <td>{formatDate(item.endsAt)}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link href={getStrategyPath(item.strategy)} className="font-semibold text-pine hover:text-ink">Details</Link>
                        {item.canAccess && (
                          <Link href={getStrategyPerformancePath(item.strategy)} className="font-semibold text-pine hover:text-ink">Backtests</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}
