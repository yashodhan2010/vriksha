import { notFound } from "next/navigation";
import Link from "next/link";
import { getStrategy } from "@/lib/data";
import { getCurrentUser, hasStrategyAccess } from "@/lib/access";

export default async function SubscribePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) notFound();
  const user = await getCurrentUser();
  const alreadySubscribed = await hasStrategyAccess(strategy.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Subscribe</p>
      <h1 className="mt-2 text-3xl font-semibold">{strategy.name}</h1>
      <div className="mt-8 card p-6">
        <p className="text-2xl font-semibold">{strategy.price}</p>
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
          <button className="mt-5 rounded bg-pine px-5 py-3 text-sm font-semibold text-white" type="button">
            Razorpay checkout placeholder
          </button>
        )}
      </div>
    </main>
  );
}
