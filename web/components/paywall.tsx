import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export function Paywall({ slug }: { slug: string }) {
  return (
    <section className="card-accent-ink p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-ink text-white">
          <LockKeyhole size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-semibold">Subscriber access required</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/68">
            The latest model portfolio and last five rebalance logs are available only to users
            with an active subscription or manual access grant.
          </p>
          <Link
            href={`/subscribe/${slug}`}
            className="mt-4 inline-flex rounded bg-pine px-4 py-2 text-sm font-medium text-white"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </section>
  );
}
