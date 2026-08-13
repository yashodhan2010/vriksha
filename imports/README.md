# Strategy Imports

Use this folder as the local handoff point from the strategy manager repo.

```text
imports/
  incoming/   Copy exported strategy packages here for review.
  accepted/   Move packages here after validation/import.
  rejected/   Move packages here if validation fails.
```

V1 local flow:

```powershell
python strategy_importer/import_package.py imports/incoming/dual-momentum/strategy-package
python strategy_importer/import_package.py imports/incoming/dual-momentum/model-portfolio-update --kind update
```

The importer writes website-ready JSON to `web/lib/imported-strategies.json`.

## Blog HTML Imports

Use `imports/blogs/` as the local drop folder for standalone blog, newsletter, or report HTML files.

```text
imports/
  blogs/      Copy one or more .html research notes here.
```

Optional metadata can be added as the first HTML comment in a file:

```html
<!--
title: Europe Weekly Market Note
date: 2026-08-11
category: Market Notes
excerpt: Weekly observations on European equities, rates, and portfolio risk.
tags: Europe, Macro, Equity
featured: true
-->
```

Supported categories are `Market Notes`, `Strategy Notes`, `Risk Analytics`, `Asset Allocation`,
`Education`, and `Compliance`. If metadata is missing, the sync command falls back to HTML
`<meta>` tags, `<title>`, first `<h1>`, and then the cleaned filename.

Run the sync from the web app folder:

```powershell
cd web
npm run blogs:sync
```

The command copies each HTML file to `web/public/blog-html/{slug}/index.html` and writes the
website manifest to `web/content/blogs.generated.json`. The generated manifest powers `/blog` and
`/blog/{slug}` automatically. Removing a source HTML file from `imports/blogs/` and running the
command again removes it from the manifest and deletes its copied public folder.

If an imported file references remote scripts, stylesheets, images, or iframes, the command prints a
warning so the report can be reviewed before publishing.
