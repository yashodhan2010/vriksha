import Link from "next/link";
import { CheckoutClient } from "@/components/checkout-client";
import { getCurrentUser } from "@/lib/access";
import { getLatestKycProfileForUser, getVerifiedKycProfileForUser } from "@/lib/kyc";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const verifiedKyc = user ? await getVerifiedKycProfileForUser(user.id) : null;
  const latestKyc = user && !verifiedKyc ? await getLatestKycProfileForUser(user.id) : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {!user && (
        <section className="card p-6">
          <h1 className="text-3xl font-semibold">Login required</h1>
          <p className="mt-2 text-sm leading-6 text-ink/68">
            Login is required before KYC and checkout.
          </p>
          <Link href="/login?next=/checkout" className="mt-4 inline-flex rounded bg-ink px-4 py-2 text-sm font-medium text-white">
            Login to continue
          </Link>
        </section>
      )}
      {user && !verifiedKyc && (
        <section className="card-accent-pine p-6">
          <h1 className="text-3xl font-semibold">KYC required before payment</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink/68">
            Fee-paying research clients must complete KYC before checkout. Current status:{" "}
            <strong className="text-ink">{latestKyc?.status?.replaceAll("_", " ") ?? "not started"}</strong>.
          </p>
          <Link href="/kyc" className="mt-5 inline-flex rounded bg-pine px-5 py-3 text-sm font-semibold text-white">
            Complete KYC
          </Link>
        </section>
      )}
      {user && verifiedKyc && <CheckoutClient />}
    </main>
  );
}
