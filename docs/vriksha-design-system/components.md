# Component Library

All components use the tokens in `tokens.json`. States are part of the component definition, not optional polish.

## Buttons

### Primary Button

Use for one main action on a screen, usually "Ask for information", "Continue", "Download", or "Confirm cancellation".

- Default: forest background, white text, 12px radius, 14-15px semibold Inter.
- Hover: slightly darker forest by applying a 6% black overlay.
- Focus: 2px forest outline, 2px offset.
- Disabled: white or pale surface, tertiary text, card border, no shadow.
- Loading: keep label visible if possible; add small text spinner only when the action exceeds one second.

### Secondary Button

Use for alternate actions and navigation.

- Default: white background, card border, body text.
- Hover: pale green wash, forest border.
- Focus: same outline as primary.
- Disabled: tertiary text, card border, no hover treatment.

### Destructive Button

Use only for cancellation confirmation and irreversible admin actions.

- Default: error wash background, stop text, stop border.
- Hover: keep restrained; no dramatic red fills.
- Confirmation copy must stay plain: "Cancel subscription" and "Keep subscription".

## Form Fields

Fields are quiet, full-width, and readable.

- Label: visible above the input, 13px semibold.
- Input: white surface, card border, 12px radius, 44px minimum height.
- Helper text: 12-13px secondary text.
- Error: stop border and error text below. Do not rely on color alone.
- Focus: 2px forest outline.
- Disabled: green wash or warm paper, tertiary text.

Field groups should use 24px vertical rhythm on desktop and 20px on mobile.

## Cards

### Research Card

Use for strategy summaries, research notes, document previews, and account panels.

- White card on warm paper.
- 1px `#ede8da` border.
- 12px radius.
- 24px padding desktop, 20px mobile.
- Optional 3px left accent bar for important context.
- Hover only when clickable: 1-2px lift, forest border tint.

### Leaf Research Card

Use only in Research Canopy / document listing contexts.

- Organic radius: 28px top-left and bottom-right, 8px other corners.
- Small leaf-vein line as low-contrast decoration.
- Category badge sits top-left.
- Avoid leaf icons that read as childish.

## Tables

Use for holdings, weights, document indexes, complaint disclosure, and compliance matrices.

- Header row: solid forest green, white text.
- Header labels: monospace or Inter semibold, 12px, uppercase where useful.
- Body: 13px or 14px Inter, zebra rows using `#f3f9f4`.
- Numeric columns align right.
- Sticky first column allowed on mobile tables.
- Never include public return figures or public performance columns.

## Callouts

Callouts use the card base plus a 3px left accent bar.

### Info

Use for methodology explanations, "how this works", and report context.

### Warning

Use for cost, liquidity, concentration, tax, or implementation caveats.

### Stop

Use for hard blocks: unsuitable assessment outcome, incomplete KYC, payment failure, or cancelled subscription.

### Compliance

Use for regulatory language, verification links, and disclosure reminders.

## Tabs and Branch Filters

Tabs should feel like organizing labels, not promotional filters.

- Label style: monospace uppercase or small Inter semibold.
- Active state: forest fill with white text.
- Inactive: white background, card border.
- Categories: Market Notes, Strategy Notes, Risk Analytics, Asset Allocation, Investor Education, Compliance.
- Research Canopy labels may map to branch language: Strategy Leaves, Risk Signals, Allocation Notes.

## Accordion

Use for compliance pages, FAQ-like disclosures, and onboarding explanations.

- Header: white card row with title and short helper text.
- Icon: simple chevron.
- Open state: forest-tinted left border.
- Content: readable paragraphs, bullets, and tables.

## Badges and Pills

Use for status, category, and verification states.

- Category: pale green wash, forest text.
- Pending: warm paper, tertiary text.
- Blocked: error wash, stop text.
- Compliance: gold-tinted border and text.
- Verification badge: white card, forest border, forest text, external-link cue.

## Breadcrumbs

Use on document reader, strategy detail, compliance subpages, and dashboard detail states.

- 12px monospace uppercase label or 13px Inter.
- Separator: `/` or `->`, tertiary color.
- Current page: body text, no link style.

## Navigation

Desktop:

- Warm paper background.
- Logo left, nav center or right depending on page density.
- One account/action area at right.
- Active nav: text weight change plus forest underline.

Mobile:

- Logo left, menu icon right.
- Full-width menu panel with 44px minimum row height.
- Avoid hiding compliance links; they can move into footer but must remain available.

## Footer

Footer is a designed legal component, not a dumping ground.

- Warm paper or white card surface.
- Legal copy in 12-13px minimum, except the prescribed market-risk sentence at 10pt minimum.
- Use a narrow top border and 3px forest accent bar.
- Verification link is visually distinct.
- Grievance path is shown as a compact sequence.

## Empty States

Dashboard before first update:

- Title: "No portfolio update published yet"
- Body: "Your subscription is active. The next fortnightly model portfolio update will appear here when published."
- Action: "View methodology" or "Download agreement"

Assessment unsuitable outcome:

- Title: "This may not be suitable right now"
- Body: precise reason based on answers.
- Action: "Read investor education notes"

## Loading States

- Use skeleton rows for tables.
- Use skeleton cards for research/document grids.
- Preserve layout size to prevent jump.
- Avoid animated counters or market-like motion.

## Error States

- State the issue in plain English.
- Tell the user what remains saved.
- Provide one recovery action.
- For compliance/admin blocks, include who to contact.
