export type BlogMediaKind = "article" | "pdf";

export type BlogPost = {
  slug: string;
  title: string;
  dek: string;
  publishedAt: string;
  readingTime: string;
  category: string;
  kind: BlogMediaKind;
  pdfPath?: string;
  heroTone: "pine" | "gold" | "sky";
  summary: string[];
  body?: Array<{
    heading: string;
    paragraphs: string[];
  }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-read-backtested-returns",
    title: "How to Read Backtested Returns Without Getting Carried Away",
    dek: "A plain-English note on CAGR, drawdowns, benchmark comparison, and the limits of historical simulations.",
    publishedAt: "2026-08-12",
    readingTime: "6 min read",
    category: "Investor education",
    kind: "article",
    heroTone: "pine",
    summary: [
      "Backtests are useful for understanding how a rules-based process behaved in historical market regimes.",
      "They are not promises of future returns, and they should be read alongside drawdowns, turnover, and benchmark context.",
      "This free information library is separate from paid model portfolio subscriptions."
    ],
    body: [
      {
        heading: "Start With The Job Of The Backtest",
        paragraphs: [
          "A backtest helps explain the behavior of a strategy rule set across past data. It can show whether returns came smoothly or in bursts, whether drawdowns were tolerable, and whether the strategy behaved differently from a benchmark.",
          "The point is not to find the highest number on the page. The point is to understand the trade-off profile before deciding whether the research is worth deeper review."
        ]
      },
      {
        heading: "Read CAGR With Drawdown",
        paragraphs: [
          "CAGR compresses a return path into one annualized number. That is useful, but incomplete. A strategy with a strong CAGR may still be difficult to hold if it has deep or frequent drawdowns.",
          "For that reason, Vriksha shows return ranges, cumulative return, monthly return behavior, and max drawdown together."
        ]
      },
      {
        heading: "Use The Benchmark As Context",
        paragraphs: [
          "Benchmark comparison helps separate market-wide movement from strategy-specific behavior. If a strategy outperformed during one regime but lagged in another, that pattern matters.",
          "Past or backtested performance does not guarantee future returns. Investors should read methodology, assumptions, risks, and disclosures before making any decision."
        ]
      }
    ]
  },
  {
    slug: "sample-research-note-pdf",
    title: "Sample Research Note PDF",
    dek: "A PDF-ready slot for uploaded information material, factsheets, or long-form research notes.",
    publishedAt: "2026-08-12",
    readingTime: "PDF",
    category: "Research note",
    kind: "pdf",
    pdfPath: "/info-media/sample-research-note.pdf",
    heroTone: "gold",
    summary: [
      "Upload PDFs into web/public/info-media and reference the file path in web/lib/blog.ts.",
      "Subscribed readers can view the PDF inline on the page.",
      "This access is free information-media access only and does not unlock paid strategy content."
    ]
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
