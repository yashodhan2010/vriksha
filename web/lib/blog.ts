import generatedBlogPosts from "@/content/blogs.generated.json";

export type BlogCategory =
  | "Market Notes"
  | "Strategy Notes"
  | "Risk Analytics"
  | "Asset Allocation"
  | "Education"
  | "Compliance";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  tags: string[];
  sourceFile: string;
  publicPath: string;
  readingTime: string;
  featured: boolean;
};

const seededPosts: BlogPost[] = [
  {
    slug: "how-to-read-backtested-returns",
    title: "How to Read Backtested Returns Without Getting Carried Away",
    date: "2026-08-12",
    category: "Education",
    excerpt:
      "A plain-English note on CAGR, drawdowns, benchmark comparison, and the limits of historical simulations.",
    tags: ["Backtesting", "Drawdowns", "Investor Education"],
    sourceFile: "seeded",
    publicPath: "",
    readingTime: "6 min read",
    featured: false
  }
];

function isGeneratedPost(value: unknown): value is BlogPost {
  if (!value || typeof value !== "object") return false;
  const post = value as Record<string, unknown>;
  return (
    typeof post.slug === "string" &&
    typeof post.title === "string" &&
    typeof post.date === "string" &&
    typeof post.category === "string" &&
    typeof post.excerpt === "string" &&
    Array.isArray(post.tags) &&
    typeof post.sourceFile === "string" &&
    typeof post.publicPath === "string" &&
    typeof post.readingTime === "string" &&
    typeof post.featured === "boolean"
  );
}

const generatedPosts = (generatedBlogPosts as unknown[]).filter(isGeneratedPost);
const generatedSlugs = new Set(generatedPosts.map((post) => post.slug));

export const blogCategories = [
  "All Notes",
  "Market Notes",
  "Strategy Notes",
  "Risk Analytics",
  "Asset Allocation",
  "Education",
  "Compliance"
] as const;

export const blogPosts: BlogPost[] = [...generatedPosts, ...seededPosts.filter((post) => !generatedSlugs.has(post.slug))]
  .sort((a, b) => {
    const dateOrder = Date.parse(b.date) - Date.parse(a.date);
    return dateOrder || a.title.localeCompare(b.title);
  });

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getFeaturedBlogPost() {
  return blogPosts.find((post) => post.featured) ?? blogPosts[0];
}
