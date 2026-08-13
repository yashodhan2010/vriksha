import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { blogCategories, blogPosts, getFeaturedBlogPost } from "@/lib/blog";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

function tagClasses(active: boolean) {
  return active
    ? "border-pine bg-pine text-white shadow-sm"
    : "border-line bg-white text-ink/68 hover:border-pine/40 hover:bg-[#fffaf4] hover:text-ink";
}

function categoryLabel(category: string) {
  if (category === "All Notes") return "All Branches";
  if (category === "Strategy Notes") return "Strategy Leaves";
  if (category === "Risk Analytics") return "Risk Signals";
  if (category === "Asset Allocation") return "Allocation Notes";
  if (category === "Education") return "Investor Education";
  return category;
}

function LeafMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block h-8 w-5 rounded-[100%_0_100%_0] border border-gold/45 bg-gold/12 ${className}`}
      aria-hidden="true"
    />
  );
}

export default async function BlogPage({
  searchParams
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const selectedCategory = (await searchParams)?.category;
  const filteredPosts =
    selectedCategory && selectedCategory !== "All Notes"
      ? blogPosts.filter((post) => post.category === selectedCategory)
      : blogPosts;
  const featured = selectedCategory ? filteredPosts[0] : getFeaturedBlogPost();
  const remainingPosts = filteredPosts.filter((post) => post.slug !== featured?.slug);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-line bg-[#fffaf4]">
        <div className="absolute right-8 top-8 hidden h-44 w-44 rounded-[100%_0_100%_0] border border-pine/10 bg-pine/[0.025] lg:block" aria-hidden="true" />
        <div className="absolute bottom-8 left-10 hidden h-28 w-20 rotate-12 rounded-[100%_0_100%_0] border border-gold/20 bg-gold/[0.04] md:block" aria-hidden="true" />
        <div className="container-page relative grid gap-9 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <LeafMark className="-rotate-12" />
              <p className="text-sm uppercase tracking-[0.18em] text-clay">From the Research Desk</p>
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">
              Research Canopy
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink/72">
              Market notes, strategy thinking, and risk-aware investing insights from Vriksha.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/62">
              Each note is a leaf from the research tree: documented, dated, and framed with the risks and disclosures expected of a SEBI RA platform.
            </p>
          </div>
          <div className="relative rounded-[28px_8px_28px_8px] border border-pine/18 bg-paper p-5 shadow-sm">
            <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-px bg-pine/18" aria-hidden="true" />
            <div className="relative grid gap-4 pl-6">
              <div className="absolute -left-[3px] top-1 h-2.5 w-2.5 rounded-full bg-pine" aria-hidden="true" />
              <div className="absolute -left-[3px] top-[4.9rem] h-2.5 w-2.5 rounded-full bg-gold" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Latest Leaves</p>
                <p className="mt-2 font-semibold">Research-led, risk-aware, documented.</p>
                <p className="mt-1 text-sm leading-6 text-ink/64">
                  Notes are educational material and should be read with methodology, assumptions, risks, and SEBI RA disclosures.
                </p>
              </div>
              <div className="border-t border-line pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">Branches of Research</p>
                <p className="mt-2 text-sm leading-6 text-ink/64">
                  Market context, strategy leaves, allocation notes, risk signals, investor education, and compliance updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        {featured && (
          <article className="relative grid overflow-hidden rounded-[34px_10px_34px_10px] border border-pine/20 bg-white shadow-sm lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative border-b border-line bg-pine p-6 text-white lg:border-b-0 lg:border-r lg:border-line/20">
              <div className="absolute -right-10 -top-12 h-32 w-24 rotate-12 rounded-[100%_0_100%_0] border border-white/12 bg-white/[0.04]" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Latest Leaf</p>
              <div className="mt-10 grid h-32 w-24 rotate-[-8deg] place-items-center rounded-[100%_0_100%_0] border border-white/22 bg-white/8">
                <span className="h-20 w-px rotate-45 bg-white/34" aria-hidden="true" />
              </div>
              <p className="mt-8 max-w-xs text-sm leading-6 text-white/72">
                The newest note in the canopy, surfaced for quick review before deeper desk reading.
              </p>
            </div>
            <div className="relative p-6 sm:p-7">
              <div className="absolute right-5 top-5 h-16 w-11 rounded-[100%_0_100%_0] border border-gold/20 bg-gold/[0.035]" aria-hidden="true" />
              <div className="flex flex-wrap gap-2 text-xs text-ink/58">
                <span className="rounded-[18px_4px_18px_4px] border border-pine/20 bg-pine/[0.06] px-3 py-1.5 text-pine">{categoryLabel(featured.category)}</span>
                <span className="inline-flex items-center gap-1.5 rounded border border-line bg-paper px-3 py-1.5">
                  <CalendarDays size={13} aria-hidden="true" />
                  {formatDate(featured.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-line bg-paper px-3 py-1.5">
                  <Clock3 size={13} aria-hidden="true" />
                  {featured.readingTime}
                </span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">{featured.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/68">{featured.excerpt}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featured.tags.map((tag) => (
                  <span className="rounded-[16px_4px_16px_4px] border border-line bg-[#fffaf4] px-3 py-1.5 text-xs text-ink/62" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-pine hover:text-ink" href={`/blog/${featured.slug}`}>
                Open research note
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </article>
        )}

        <div className="mt-9">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Browse by Branch</p>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {blogCategories.map((category) => {
              const active = category === (selectedCategory ?? "All Notes");
              return (
                <Link
                  href={category === "All Notes" ? "/blog" : `/blog?category=${encodeURIComponent(category)}`}
                  className={`relative shrink-0 rounded-[18px_4px_18px_4px] border px-3 py-2 text-xs font-semibold ${tagClasses(active)}`}
                  key={category}
                >
                  <span className="mr-2 inline-block h-3 w-2 rounded-[100%_0_100%_0] border border-current/30 align-[-1px]" aria-hidden="true" />
                  {categoryLabel(category)}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded border border-line bg-[#fffaf4] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">Research stem</p>
              <div className="mt-5 grid gap-5 border-l border-pine/18 pl-4">
                {filteredPosts.slice(0, 4).map((post) => (
                  <Link className="relative block text-sm font-semibold text-ink/72 hover:text-pine" href={`/blog/${post.slug}`} key={post.slug}>
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-pine/30 bg-paper" aria-hidden="true" />
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-clay">{categoryLabel(post.category)}</span>
                    <span className="mt-1 line-clamp-2 block">{post.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <section className="grid gap-4 md:grid-cols-2">
            {remainingPosts.map((post) => (
              <article
                className="group relative flex min-h-[292px] flex-col overflow-hidden rounded-[30px_8px_30px_8px] border border-line bg-[#fffaf4] p-5 shadow-xs transition duration-250 ease-out hover:-translate-y-0.5 hover:border-pine/30 hover:bg-white hover:shadow-sm"
                key={post.slug}
              >
                <div className="absolute right-4 top-4 h-14 w-10 rounded-[100%_0_100%_0] border border-pine/10 bg-pine/[0.025] transition duration-250 group-hover:rotate-3 group-hover:border-gold/25 group-hover:bg-gold/[0.04]" aria-hidden="true" />
                <div className="absolute bottom-5 left-5 h-px w-20 bg-pine/10" aria-hidden="true" />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="inline-flex items-center gap-2 rounded-[16px_4px_16px_4px] border border-pine/15 bg-pine/[0.045] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-clay">
                      <span className="h-3 w-2 rounded-[100%_0_100%_0] border border-pine/30 bg-white" aria-hidden="true" />
                      {categoryLabel(post.category)}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold">{post.title}</h2>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/68">{post.excerpt}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/58">
                  <span className="rounded border border-line bg-white px-3 py-1.5">{formatDate(post.date)}</span>
                  <span className="rounded border border-line bg-white px-3 py-1.5">{post.readingTime}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span className="rounded-[14px_4px_14px_4px] border border-line bg-paper px-2.5 py-1 text-xs text-ink/58" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <Link className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-pine hover:text-ink" href={`/blog/${post.slug}`}>
                  Open note
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </section>
        </div>
        {filteredPosts.length === 0 && (
          <div className="mt-5 rounded-[28px_8px_28px_8px] border border-line bg-white p-6 text-sm leading-6 text-ink/66">
            No leaves are currently filed under this research branch.
          </div>
        )}
      </section>
    </main>
  );
}
