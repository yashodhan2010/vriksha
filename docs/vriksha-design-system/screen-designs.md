# Screen Designs

These are implementation-ready layout specs. They describe desktop and mobile behavior for each requested screen while respecting the regulatory constraints in the brief.

## 1. Home

Purpose: explain what Vriksha is, who it is for, who it is not for, and offer one action.

Desktop layout:

- Header.
- Hero with one serif statement: "Rules-based model portfolios for self-directed investors."
- Supporting paragraph: "You receive research, holdings, and weights. You place trades yourself. Vriksha does not handle client funds or execute trades."
- Primary action: "Ask for information".
- Three factual panels: "What you receive", "What you do", "What Vriksha does not do".
- "Not for everyone" card with plain exclusions: needs guaranteed outcomes, wants trade execution, cannot tolerate market risk, wants frequent tips.
- Legal footer.

Mobile layout:

- Hero copy stacks above the factual panels.
- Primary action remains visible after the first paragraph.
- "Not for everyone" appears before any process detail.

No pricing and no public performance area.

## 2. Strategy Page

Purpose: explain construction and suitability without showing performance.

Desktop layout:

- Breadcrumb.
- Strategy title and short description.
- Data card grid: universe, holdings count, rebalance frequency, benchmark, update cadence.
- Two-column section: designed for / not designed for.
- Methodology accordion: universe, ranking, exclusions, rebalance process, review process.
- Risk callouts: concentration, turnover, liquidity, tax, execution timing.
- Compliance note and enquiry action.
- Legal footer.

Mobile layout:

- Data cards become two-column compact cards.
- Designed-for / not-designed-for cards stack.
- Accordions reduce long content.

No return chart, no CAGR, no drawdown, no relative performance placeholder.

## 3. Document Reader

Purpose: make long PDFs/HTML reports feel like serious research documents.

Desktop layout:

- Header.
- Breadcrumb.
- Document title, category, date, reading time, tags.
- Left sidebar contents, 280px width, sticky below header.
- Main reading frame, max measure 720px for native text or full-width framed report for HTML/PDF.
- Download button and "Open original" link.
- Compliance callout above document.
- Legal footer.

Mobile layout:

- Contents becomes a horizontal jump list or collapsible "Contents" panel.
- Document frame gets full viewport width with generous top/bottom spacing.
- Download control sits above the document.

## 4. Self-Assessment

Purpose: help visitors decide whether Vriksha fits them. It is not a lead-capture quiz.

Desktop layout:

- Compact intro card explaining the tool.
- Five-step progress rail: Experience, Capital, Drawdown comfort, Execution ability, Expectations.
- One question per screen.
- Answers as large radio cards with clear descriptions.
- Outcome screen has one of three tones: suitable to learn more, needs caution, not suitable right now.

Respectful unsuitable outcome:

- Stop callout, not a red alarm.
- Copy: "This may not be suitable right now."
- Explain the reason and point to investor education.
- No forced enquiry form.

Mobile layout:

- Progress rail becomes five dots with current label.
- Answer cards remain full width.

## 5. Capital Calculator

Purpose: evaluate practical implementability, not expected returns.

Desktop layout:

- Small widget card.
- Inputs: amount, strategy, broker lot/rounding preference if needed.
- Output: feasibility state, approximate number of holdings, minimum practical amount, cash drift note, implementation caveats.
- Warning callout for small amounts or high fragmentation.

Mobile layout:

- Inputs stack.
- Output uses simple status card.

Never show projected returns, expected gains, or growth curves.

## 6. Enquiry Form

Purpose: single conversion action.

Desktop layout:

- Two columns: form and "what happens next" factual panel.
- Fields: name, email, strategy interest, optional message.
- Consent checkbox for receiving information.
- Submit button: "Send enquiry".
- Confirmation state explains response timing and no obligation.

Mobile layout:

- Form first.
- "What happens next" below.

No urgency copy and no sales promises.

## 7. Onboarding

Purpose: identity -> declarations -> agreement -> payment -> done.

Desktop layout:

- Header.
- Left progress sidebar with five steps and saved status.
- Main form panel.
- Persistent footer row inside panel: Back, Save and leave, Continue.
- Blocking state uses stop callout with reason and next action.

Step details:

- Identity: personal details, PAN, contact.
- Declarations: self-directed investor confirmations.
- Agreement: document reader with acceptance checkbox.
- Payment: subscription fee summary, billing details.
- Done: access instructions and next update timing.

Mobile layout:

- Progress is a compact top rail.
- Save and leave remains visible.
- Long documents open in reader view.

## 8. Subscriber Dashboard

Purpose: show current model portfolio and subscriber documents.

Desktop layout:

- Status header with subscription state and latest update date.
- Current portfolio table: symbol, company, sector, weight, action/status if required.
- Download button.
- Latest update note card.
- History table.
- Account settings panel.
- Empty state before first update.

Mobile layout:

- Portfolio table supports horizontal scroll.
- Summary cards stack above table.
- Download remains near the latest update.

Weights are portfolio instructions, not performance figures, and are allowed.

## 9. Account / Cancel

Purpose: allow cancellation without guilt or retention interception.

Desktop layout:

- Account summary.
- Billing details.
- Cancel subscription row with secondary/destructive styling.
- Confirmation dialog: one sentence, one confirm button, one keep button.
- Post-cancel state: access end date and document access explanation.

Mobile layout:

- Same flow, full-width confirmation sheet.

No "are you sure you want to lose benefits" language.

## 10. Compliance / Disclosures

Purpose: dense regulatory content made navigable.

Desktop layout:

- Page title and summary.
- Left contents sidebar.
- Sections as accordions or anchored cards.
- Registration details card with verification badge.
- Grievance path component.
- Complaints disclosure table.
- Legal footer.

Mobile layout:

- Contents becomes sticky select/jump menu.
- Long tables scroll horizontally.
- Verification badge appears near top.

## Required Legal Footer Component

Use this block on every screen:

```text
Prathmesh Jaiprakash Gupta, Individual Research Analyst, registered with SEBI under registration number INH000027788, granted 4 June 2026. Enlisted with BSE Administration & Supervision Ltd. (RAASB), enlistment number 7261.

Registered office: 701 & 702, Floor-7, Sunset (Padmavati) CHS, Eknath Buwa Hatiskar Marg, Hatiskarwadi, Nr. Telephone Exchange, Prabhadevi, Mumbai, Maharashtra 400025.

[Verify this registration on the public registry ->]

Investment in securities market are subject to market risks. Read all the related documents carefully before investing.

Registration granted by SEBI and certification from NISM in no way guarantee the performance of the intermediary or provide any assurance of returns to investors.

Grievances: Customer Care +91 99305 21527 -> Compliance Officer (21 working days) -> Principal Officer -> SEBI SCORES -> SMART ODR
```

The market-risk sentence must not be rewritten.
