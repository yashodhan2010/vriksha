import { notFound } from "next/navigation";
import { getStrategy } from "@/lib/data";

export default async function SubscribePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const strategy = getStrategy(slug);
  if (!strategy) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.18em] text-clay">Subscribe</p>
      <h1 className="mt-2 text-3xl font-semibold">{strategy.name}</h1>
      <div className="mt-8 rounded border border-line bg-[#fffaf4] p-6">
        <p className="text-2xl font-semibold">{strategy.price}</p>
        <p className="mt-3 text-sm leading-6 text-ink/68">
          Payment integration will create a Razorpay subscription, listen to webhooks, and unlock
          strategy access when the subscription is active.
        </p>
        <button className="mt-5 rounded bg-pine px-5 py-3 text-sm font-semibold text-white" type="button">
          Razorpay checkout placeholder
        </button>
      </div>
    </main>
  );
}
