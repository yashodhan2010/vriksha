import { notFound } from "next/navigation";
import Link from "next/link";
import { StrategyBasketButton } from "@/components/strategy-basket-button";
import { getStrategy } from "@/lib/data";
import { getCurrentUser, hasStrategyAccess } from "@/lib/access";
import { billingCycles, formatMoney, getStrategyPrice } from "@/lib/pricing";

export default async function SubscribePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) notFound();
  const user = await getCurrentUser();
  const alreadySubscribed = await hasStrategyAccess(strategy.slug);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Subscribe</p>
      <h1 className="mt-2 text-3xl font-semibold">{strategy.name}</h1>
      <div className="mt-8 card p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {billingCycles.map((cycle) => {
            const price = getStrategyPrice(strategy.slug, cycle.id);
            return (
              <div className="rounded border border-line bg-white p-4" key={cycle.id}>
                <p className="text-sm font-semibold">{cycle.label}</p>
                <p className="mt-2 text-2xl font-semibold">{formatMoney(price.amountPaise)}</p>
                <p className="mt-1 text-xs text-ink/58">{price.accessDays} days access</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-sm leading-6 text-ink/68">
          Subscription requires a verified login. Login alone does not unlock the model portfolio;
          access is created only after payment confirmation or a manual admin grant.
        </p>
        {!user && (
          <Link
            href={`/login?next=${encodeURIComponent(`/subscribe/${strategy.slug}`)}`}
            className="mt-5 inline-flex rounded bg-ink px-5 py-3 text-sm font-semibold text-white"
          >
            Login to continue
          </Link>
        )}
        {user && alreadySubscribed && (
          <Link
            href={`/strategies/${strategy.slug}`}
            className="mt-5 inline-flex rounded bg-pine px-5 py-3 text-sm font-semibold text-white"
          >
            Open subscriber view
          </Link>
        )}
        {user && !alreadySubscribed && (
          <div className="mt-5 flex flex-wrap gap-2">
            <StrategyBasketButton slug={strategy.slug} label="Add to basket" />
            <Link href="/checkout" className="rounded border border-line px-5 py-3 text-sm font-semibold">
              Open checkout
            </Link>
          </div>
        )}
        <div className="mt-6 rounded border border-line bg-paper p-4 text-xs leading-5 text-ink/62">
          Fees shown are placeholder research subscription fees. Checkout requires terms
          acceptance, fee-limit acknowledgement, and Razorpay webhook confirmation before access is
          unlocked.
        </div>
      </div>
    </main>
  );
}
