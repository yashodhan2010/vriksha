import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, FileText, LockKeyhole } from "lucide-react";
import { InfoSubscribePanel } from "@/components/info-subscribe-panel";
import { getCurrentUser, hasInfoSubscription } from "@/lib/access";
import { blogPosts, getBlogPost } from "@/lib/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

function LockedMediaPreview() {
  return (
    <div className="relative mt-6 overflow-hidden rounded border border-line bg-white p-4">
      <div className="space-y-4 opacity-45 blur-[1.5px]" aria-hidden="true">
        <div className="h-5 w-2/3 rounded bg-ink/12" />
        <div className="h-3 w-full rounded bg-line" />
        <div className="h-3 w-5/6 rounded bg-line" />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-24 rounded bg-pine/10" />
          <div className="h-24 rounded bg-gold/15" />
          <div className="h-24 rounded bg-sky/50" />
        </div>
        <div className="h-48 rounded bg-paper" />
      </div>
      <div className="absolute inset-0 grid place-items-center bg-white/58 backdrop-blur-[2px]">
        <div className="mx-4 max-w-sm rounded border border-pine/25 bg-white p-4 text-center shadow-sm">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded bg-pine text-white">
            <LockKeyhole size={18} aria-hidden="true" />
          </span>
          <p className="mt-3 font-semibold">Subscribe free to continue reading</p>
          <p className="mt-1 text-sm leading-6 text-ink/64">
            Blog and information-media access is free, but separate from paid strategy access.
          </p>
        </div>
      </div>
    </div>
  );
}

function PdfViewer({ title, pdfPath }: { title: string; pdfPath: string }) {
  return (
    <div className="mt-6 overflow-hidden rounded border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText size={17} className="text-pine" aria-hidden="true" />
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <a className="text-sm font-semibold text-pine hover:text-ink" href={pdfPath} target="_blank" rel="noreferrer">
          Open PDF
        </a>
      </div>
      <object data={pdfPath} type="application/pdf" className="h-[72vh] w-full bg-paper">
        <div className="p-6 text-sm leading-6 text-ink/68">
          This PDF could not be rendered inline. Upload the file to <code>web/public/info-media</code> and make sure the path in <code>web/lib/blog.ts</code> matches.
        </div>
      </object>
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

  const [user, subscribed] = await Promise.all([getCurrentUser(), hasInfoSubscription()]);
  const nextPath = `/blog/${post.slug}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-3 py-2 text-sm font-semibold text-ink/72 transition duration-180 hover:border-pine/40 hover:text-pine"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Blog library
      </Link>

      <article className="mt-7">
        <p className="text-sm uppercase tracking-[0.18em] text-clay">{post.category}</p>
        <h1 className="mt-2 text-3xl font-semibold">{post.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/68">{post.dek}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/58">
          <span className="rounded border border-line bg-white px-3 py-1.5">{post.readingTime}</span>
          <span className="rounded border border-line bg-white px-3 py-1.5">{post.kind === "pdf" ? "PDF media" : "Article"}</span>
          <span className="rounded border border-pine/20 bg-pine/[0.06] px-3 py-1.5 text-pine">Free info subscription</span>
        </div>

        {!subscribed && (
          <>
            <InfoSubscribePanel loggedIn={Boolean(user)} className="mt-7" nextPath={nextPath} />
            <LockedMediaPreview />
          </>
        )}

        {subscribed && post.kind === "pdf" && post.pdfPath && (
          <PdfViewer title={post.title} pdfPath={post.pdfPath} />
        )}

        {subscribed && post.kind === "article" && (
          <div className="mt-7 grid gap-6">
            <section className="rounded border border-line bg-white p-5">
              <h2 className="text-xl font-semibold">Key Takeaways</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink/70">
                {post.summary.map((item) => (
                  <li className="rounded border border-line bg-paper px-4 py-3" key={item}>{item}</li>
                ))}
              </ul>
            </section>
            {post.body?.map((section) => (
              <section className="rounded border border-line bg-white p-5" key={section.heading}>
                <h2 className="text-xl font-semibold">{section.heading}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-ink/72">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
