# Vriksha Capital Design System

This folder is an editable handoff pack for Vriksha Capital. It translates the brand book into tokens, component rules, screen layouts, presentation masters, and a browser-viewable design board.

Use `brand-book.pdf` as the canonical visual reference. Open `design-board.html` in a browser to inspect the working UI translation, and use `tokens.json` as the implementation source of truth.

## Brand Book

The Pomelli brand book defines the core identity:

- Positioning: SEBI-registered Research Analyst firm providing research-led model portfolios and systematic investment insights.
- Line: "Invest with a system. Not a hunch."
- Typography: Fraunces for primary display/headings and Inter for body/UI.
- Palette: Onyx Black `#1F3A33`, Pure White `#FFFFFF`, Chalk White `#F7F4EF`, and Fawn Brown `#D9B36A`.
- Voice: research-led, disciplined, transparent, risk-aware, professional, analytical, unbiased, and empowering.
- Aesthetic: botanical sophistication, academic earthiness, forest-toned minimalism, systematic refinement, and rooted intellectualism.

## Core Principle

Credibility before persuasion. The interface should feel like a careful research publication and a well-set legal document: quiet, precise, readable, and comfortable with saying what Vriksha is not.

## Non-Negotiable Rules

- No performance figures in public design surfaces.
- No superlatives, testimonials, urgency mechanics, trust badges, customer faces, or regulatory logos.
- Use text attribution for SEBI, BSE Administration & Supervision Ltd. and RAASB.
- The legal footer block appears on every screen.
- The prescribed market-risk sentence must be set exactly and at 10pt minimum:

```text
Investment in securities market are subject to market risks. Read all the related documents carefully before investing.
```

## Type Scale

Fraunces is used for display and headings. Inter is used for body and UI. Monospace is used sparingly for metadata, table labels, IDs, and status labels.

| Token | Size | Use |
|---|---:|---|
| `caption` | 11px | Dense table metadata, helper labels |
| `label` | 12px | Pills, tabs, uppercase labels |
| `small` | 13px | Secondary UI text |
| `body` | 15px | Default content |
| `bodyLarge` | 17px | Intro paragraphs |
| `h4` | 20px | Card headings |
| `h3` | 26px | Section headings |
| `h2` | 34px | Page sections |
| `h1` | 48px | Page title |
| `display` | 64px | Slide masters and rare hero statements |

Headings use `-0.02em` tracking. Body text uses `0` letter spacing. Uppercase monospace labels use `0.14em`.

## Spacing Scale

The spacing system is 4px-based: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.

Use generous spacing around page sections and compact spacing inside dense tools. The platform should never feel crowded, but portfolio tables and compliance pages must remain scannable.

## Component Rules

- Cards: white on warm paper, 1px `#ede8da`, 12px radius, 24px padding.
- Callouts: same card base with a 3px left accent bar.
- Tables: forest-green header row with white text, zebra body rows, no decorative chart marks.
- Buttons: primary action is forest green; secondary action is white with border.
- Focus: 2px forest-green outline with 2px offset on all interactive controls.
- Forms: labels are visible, helper/error text sits below the field, required fields are explicit.
- Tabs: use branch-like labels, not marketing categories.
- Empty states: factual and respectful. Give the next available action.
- Error states: explain what happened and what the user can do next.

## Callout Variants

| Variant | Accent | Use |
|---|---|---|
| Info | `#0f5d3a` | Methodology notes, document context |
| Warning | `#d48a5c` | Constraints, implementation caution |
| Stop | `#a05a5a` on `#fef2f2` | Blocking states, unsuitable assessment outcome |
| Compliance | `#c49a3a` | Required regulatory copy and disclosure links |

## Deliverables

- `tokens.json`: named design tokens.
- `components.md`: component library specification.
- `screen-designs.md`: desktop and mobile layout guidance for requested screens.
- `presentation-masters.md`: 10 slide master specifications.
- `design-board.html`: editable HTML/CSS visual board.
- `assets/leaf-mark.svg`: restrained leaf/stem motif for badges and dividers.

## Registry Link

Use the public SEBI registered-intermediaries registry for verification:

`https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=14`

The visual label can say "Verify this registration". Do not use SEBI, BSE, or RAASB logos.
