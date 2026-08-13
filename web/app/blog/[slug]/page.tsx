import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

function SeededArticle({ slug }: { slug: string }) {
  if (slug !== "how-to-read-backtested-returns") return null;

  return (
    <div className="mt-7 grid gap-5">
      <section className="rounded border border-line bg-white p-5">
        <h2 className="text-xl font-semibold">Start With The Job Of The Backtest</h2>
        <div className="mt-3 space-y-3 text-sm leading-7 text-ink/72">
          <p>
            A backtest helps explain the behavior of a strategy rule set across past data. It can show whether returns came smoothly or in bursts, whether drawdowns were tolerable, and whether the strategy behaved differently from a benchmark.
          </p>
          <p>
            The point is not to find the highest number on the page. The point is to understand the trade-off profile before deciding whether the research is worth deeper review.
          </p>
        </div>
      </section>
      <section className="rounded border border-line bg-white p-5">
        <h2 className="text-xl font-semibold">Read CAGR With Drawdown</h2>
        <div className="mt-3 space-y-3 text-sm leading-7 text-ink/72">
          <p>
            CAGR compresses a return path into one annualized number. That is useful, but incomplete. A strategy with a strong CAGR may still be difficult to hold if it has deep or frequent drawdowns.
          </p>
          <p>
            Past or backtested performance does not guarantee future returns. Investors should read methodology, assumptions, risks, and disclosures before making any decision.
          </p>
        </div>
      </section>
    </div>
  );
}

export default async function BlogDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main>
      <section className="border-b border-line bg-[#fffaf4]">
        <div className="container-page py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/72 transition duration-180 hover:border-pine/40 hover:text-pine"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Back to Research Notes
          </Link>

          <article className="mt-7 max-w-4xl">
            <p className="text-sm uppercase tracking-[0.18em] text-clay">{post.category}</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{post.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-ink/68">{post.excerpt}</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-ink/58">
              <span className="rounded border border-pine/20 bg-pine/[0.06] px-3 py-1.5 text-pine">{formatDate(post.date)}</span>
              <span className="rounded border border-line bg-white px-3 py-1.5">{post.readingTime}</span>
              {post.tags.map((tag) => (
                <span className="rounded border border-line bg-white px-3 py-1.5" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="rounded border border-pine/20 bg-pine/[0.04] p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-pine text-white">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">Research note disclosure</p>
              <p className="mt-1 text-sm leading-6 text-ink/66">
                This material is provided as educational information from Vriksha Research. It does not unlock or represent paid model portfolio access, and should be read with risks, assumptions, and applicable disclosures.
              </p>
            </div>
          </div>
        </div>

        {post.publicPath ? (
          <div className="mt-6 overflow-hidden rounded border border-line bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
              <p className="text-sm font-semibold text-ink/78">Embedded research report</p>
              <a
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-pine hover:text-ink"
                href={post.publicPath}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
            <iframe
              title={post.title}
              src={post.publicPath}
              className="h-[78vh] min-h-[560px] w-full bg-white"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <SeededArticle slug={post.slug} />
        )}

        <div className="mt-6 rounded border border-line bg-[#fffaf4] p-4 text-sm leading-6 text-ink/66">
          This research note is for educational and informational purposes only. It is not investment advice, a recommendation, or a solicitation. Market data, model outputs, and views may change. Please read all disclosures before making investment decisions.
        </div>
      </section>
    </main>
  );
}
