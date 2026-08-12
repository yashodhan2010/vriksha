import Link from "next/link";
import { ArrowRight, FileText, MailCheck } from "lucide-react";
import { InfoSubscribePanel } from "@/components/info-subscribe-panel";
import { getCurrentUser, hasInfoSubscription } from "@/lib/access";
import { blogPosts } from "@/lib/blog";

export default async function BlogPage() {
  const [user, subscribed] = await Promise.all([getCurrentUser(), hasInfoSubscription()]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-clay">Vriksha Library</p>
          <h1 className="mt-2 text-3xl font-semibold">Blogs and Information Media</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">
            Educational notes, research explainers, PDFs, and newsletter-style updates for readers who want to learn before they subscribe to a paid strategy.
          </p>
        </div>
        {subscribed ? (
          <div className="rounded border border-pine/25 bg-pine/[0.04] p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-pine text-white">
                <MailCheck size={17} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold">Free information access active</p>
                <p className="mt-1 text-sm leading-6 text-ink/64">
                  This unlocks blogs and information media only. Paid strategy access remains separate.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <InfoSubscribePanel loggedIn={Boolean(user)} nextPath="/blog" />
        )}
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article className="card-interactive p-5" key={post.slug}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay">{post.category}</p>
                <h2 className="mt-2 text-xl font-semibold">{post.title}</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-pine/10 text-pine">
                <FileText size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/68">{post.dek}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/58">
              <span className="rounded border border-line bg-white px-3 py-1.5">{post.readingTime}</span>
              <span className="rounded border border-line bg-white px-3 py-1.5">{post.kind === "pdf" ? "PDF media" : "Article"}</span>
              {!subscribed && <span className="rounded border border-pine/20 bg-pine/[0.06] px-3 py-1.5 text-pine">Free subscription required</span>}
            </div>
            <Link
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-pine hover:text-ink"
              href={`/blog/${post.slug}`}
            >
              Open
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
