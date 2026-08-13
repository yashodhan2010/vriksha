import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptDir, "..");
const projectRoot = path.resolve(webDir, "..");
const importDir = path.join(projectRoot, "imports", "blogs");
const publicRoot = path.join(webDir, "public", "blog-html");
const manifestPath = path.join(webDir, "content", "blogs.generated.json");

const allowedCategories = new Set([
  "Market Notes",
  "Strategy Notes",
  "Risk Analytics",
  "Asset Allocation",
  "Education",
  "Compliance"
]);

const summary = {
  added: [],
  updated: [],
  skipped: [],
  errors: [],
  warnings: []
};

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function cleanText(value = "") {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseFromFilename(filename) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value) {
  const slug = String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "research-note";
}

function parseFrontmatter(html) {
  const match = html.match(/^\s*<!--([\s\S]*?)-->/);
  if (!match) return {};

  return match[1].split(/\r?\n/).reduce((metadata, line) => {
    const field = line.match(/^\s*([A-Za-z][\w-]*)\s*:\s*(.*?)\s*$/);
    if (field) metadata[field[1].toLowerCase()] = field[2];
    return metadata;
  }, {});
}

function getMetaContent(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta\\s+[^>]*name=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*name=["']${escaped}["'][^>]*>`, "i"),
    new RegExp(`<meta\\s+[^>]*property=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return cleanText(match[1]);
  }

  return "";
}

function firstTagText(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1] ? cleanText(match[1]) : "";
}

function visibleText(html) {
  return cleanText(
    html
      .replace(/^\s*<!--[\s\S]*?-->/, " ")
      .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
  );
}

function estimateReadingTime(text) {
  const words = text.match(/\b[\w'-]+\b/g)?.length ?? 0;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

function parseTags(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeDate(value) {
  if (value && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

function hasExternalUrl(value) {
  return /^https?:\/\//i.test(value) || /^\/\//.test(value);
}

function inspectExternalReferences(html, sourceFile) {
  const checks = [
    { label: "script", regex: /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi },
    { label: "stylesheet", regex: /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi },
    { label: "asset", regex: /<(?:img|iframe|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi }
  ];

  for (const check of checks) {
    for (const match of html.matchAll(check.regex)) {
      if (hasExternalUrl(match[1])) {
        summary.warnings.push(`${sourceFile}: external ${check.label} reference detected (${match[1]})`);
      }
    }
  }
}

function hardenCopiedHtml(html) {
  return html.replace(/<a\b([^>]*)>/gi, (full, attrs) => {
    const hasHref = /\shref\s*=/i.test(attrs);
    if (!hasHref) return full;

    let nextAttrs = attrs;
    if (!/\starget\s*=/i.test(nextAttrs)) nextAttrs += ' target="_blank"';
    if (/\srel\s*=/i.test(nextAttrs)) {
      nextAttrs = nextAttrs.replace(/\srel=(["'])(.*?)\1/i, (_match, quote, rel) => {
        const values = new Set(String(rel).split(/\s+/).filter(Boolean));
        values.add("noopener");
        values.add("noreferrer");
        return ` rel=${quote}${Array.from(values).join(" ")}${quote}`;
      });
    } else {
      nextAttrs += ' rel="noopener noreferrer"';
    }
    return `<a${nextAttrs}>`;
  });
}

async function findHtmlFiles(dir) {
  if (!existsSync(dir)) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(entryPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(entryPath);
    }
  }

  return files.sort((a, b) => normalizePath(a).localeCompare(normalizePath(b)));
}

async function readManifest() {
  try {
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildMetadata(html, filePath) {
  const frontmatter = parseFrontmatter(html);
  const fallbackTitle = titleCaseFromFilename(filePath);
  const title =
    cleanText(frontmatter.title) ||
    getMetaContent(html, "title") ||
    getMetaContent(html, "og:title") ||
    firstTagText(html, "title") ||
    firstTagText(html, "h1") ||
    fallbackTitle;

  const date = normalizeDate(frontmatter.date || getMetaContent(html, "article:published_time"));
  const rawCategory = cleanText(frontmatter.category) || "Market Notes";
  const category = allowedCategories.has(rawCategory) ? rawCategory : rawCategory;
  const excerpt =
    cleanText(frontmatter.excerpt) ||
    getMetaContent(html, "description") ||
    getMetaContent(html, "og:description") ||
    visibleText(html).slice(0, 170).replace(/\s+\S*$/, "") ||
    "A Vriksha research note for disciplined market review.";
  return {
    baseSlug: slugify(frontmatter.slug || title || fallbackTitle),
    title,
    date,
    category,
    excerpt,
    tags: parseTags(frontmatter.tags),
    readingTime: estimateReadingTime(visibleText(html)),
    featured: String(frontmatter.featured || "").toLowerCase() === "true"
  };
}

async function sync() {
  await mkdir(importDir, { recursive: true });
  await mkdir(publicRoot, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });

  const previousManifest = await readManifest();
  const previousBySource = new Map(previousManifest.map((post) => [post.sourceFile, post]));
  const htmlFiles = await findHtmlFiles(importDir);
  const usedSlugs = new Set();
  const nextManifest = [];

  for (const filePath of htmlFiles) {
    const sourceFile = normalizePath(path.relative(projectRoot, filePath));

    try {
      const html = await readFile(filePath, "utf8");
      if (!html.trim()) {
        summary.skipped.push(`${sourceFile}: empty file`);
        continue;
      }

      inspectExternalReferences(html, sourceFile);
      const metadata = buildMetadata(html, filePath);
      const existing = previousBySource.get(sourceFile);
      let slug = existing?.slug && !usedSlugs.has(existing.slug) ? existing.slug : metadata.baseSlug;
      let index = 2;
      while (usedSlugs.has(slug)) {
        slug = `${metadata.baseSlug}-${index}`;
        index += 1;
      }
      usedSlugs.add(slug);

      const publicDir = path.join(publicRoot, slug);
      const publicFile = path.join(publicDir, "index.html");
      await mkdir(publicDir, { recursive: true });
      await writeFile(publicFile, hardenCopiedHtml(html), "utf8");

      const post = {
        ...metadata,
        slug,
        sourceFile,
        publicPath: `/blog-html/${slug}/index.html`
      };
      delete post.baseSlug;

      nextManifest.push(post);
      summary[existing ? "updated" : "added"].push(`${post.title} (${post.slug})`);
    } catch (error) {
      summary.errors.push(`${sourceFile}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const activeSlugs = new Set(nextManifest.map((post) => post.slug));
  for (const previous of previousManifest) {
    if (previous.slug && !activeSlugs.has(previous.slug)) {
      await rm(path.join(publicRoot, previous.slug), { recursive: true, force: true });
    }
  }

  nextManifest.sort((a, b) => {
    const dateOrder = Date.parse(b.date) - Date.parse(a.date);
    return dateOrder || a.title.localeCompare(b.title);
  });

  await writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`, "utf8");

  console.log("Vriksha blog sync complete");
  console.log(`Source: ${normalizePath(path.relative(projectRoot, importDir))}`);
  console.log(`Manifest: ${normalizePath(path.relative(projectRoot, manifestPath))}`);
  console.log(`Added: ${summary.added.length}`);
  summary.added.forEach((item) => console.log(`  + ${item}`));
  console.log(`Updated: ${summary.updated.length}`);
  summary.updated.forEach((item) => console.log(`  ~ ${item}`));
  console.log(`Skipped: ${summary.skipped.length}`);
  summary.skipped.forEach((item) => console.log(`  - ${item}`));
  console.log(`Warnings: ${summary.warnings.length}`);
  summary.warnings.forEach((item) => console.log(`  ! ${item}`));
  console.log(`Errors: ${summary.errors.length}`);
  summary.errors.forEach((item) => console.log(`  x ${item}`));

  if (summary.errors.length > 0) {
    process.exitCode = 1;
  }
}

sync().catch((error) => {
  console.error("Blog sync failed");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
