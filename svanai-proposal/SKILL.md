---
name: svanai-proposal
description: Interview for, price, draft, render, and verify an evidence-bound svanAI client proposal.
---

# svanAI Proposal

Create English, client-facing proposals for `svanAI`, the brand of `SvanAI Technologies LLP`. Treat the proposal as a **commercial spine**: scope, delivery, acceptance, price, responsibilities, and terms must tell one reconciled story.

## 1. Open the intake

Read [intake.md](references/intake.md). Inspect every supplied brief, email, transcript, RFP, POC result, requirements file, estimate, or contract term before asking questions. Treat a short prompt as an empty brief and run the complete interview.

Ask whether to research the client and industry before browsing. Record every field as `confirmed`, `derived`, `assumption`, or `TBC`, with its source. Ask 3-5 related questions per round and show remaining gaps.

Complete this step only when every applicable intake field has a state and every contradiction is surfaced.

## 2. Select the branch

Read [branches.md](references/branches.md). Confirm the engagement, prior-POC context, commercial model, package choice, and IP mode. Recommend a branch when the user is unsure, then obtain confirmation.

Complete this step only when every branch axis is explicit and irrelevant sections are identified.

## 3. Freeze the brief

Present one consolidated brief containing facts, assumptions, exclusions, acceptance measures, delivery phases, responsibilities, commercial choices, legal choices, and unresolved items. Classify the document as:

- `DRAFT / INDICATIVE`: may retain visibly marked assumptions or `TBC` fields.
- `CLIENT-READY FINAL`: requires confirmation of client identity, scope, price, dates, currency/taxes, metrics, and applicable legal terms.

Complete this step only after the user approves the consolidated brief or explicitly requests an indicative draft.

## 4. Build the commercial spine

Read [pricing.md](references/pricing.md). Keep employee costs, margins, contingency logic, discounts, and the cost-derived versus value-based comparison private. Generate `pricing.xlsx` with `scripts/build-pricing.mjs`, inspect formulas and totals, and ask the user to select the client price.

Complete this step only when the workbook status is `PASS`, the selected price agrees across every client-facing section, and the user has confirmed it.

## 5. Compose the proposal

Read [content-standard.md](references/content-standard.md) and [legal.md](references/legal.md). Read [brand-and-layout.md](references/brand-and-layout.md) when building or changing visual output.

Read [proposal-json.md](references/proposal-json.md). Populate a proposal JSON payload using `assets/proposal-template.json`; omit blocks excluded by the selected branch. Build `proposal.html` with `scripts/build-proposal.py`. Use approved evidence for metrics and claims; place missing facts only in a draft as visibly marked assumptions.

Complete this step only when every included claim has an intake source and scope, roadmap, acceptance, responsibilities, price, milestones, and terms contain no contradiction.

## 6. Render and inspect

Render `proposal.html` to `proposal.pdf` with `scripts/render-pdf.py`. Read [quality-gates.md](references/quality-gates.md), render every PDF page to PNG, and inspect every page. Fix overflow, clipping, sparse orphan pages, broken tables, inconsistent page numbering, and weak hierarchy. Re-render after every material correction.

Complete this step only when all content, commercial, workbook, and visual gates pass.

## 7. Deliver

Deliver exactly these run artifacts:

- `proposal.pdf` - client-facing
- `proposal.html` - editable branded source
- `intake.yaml` - private evidence ledger and approvals
- `pricing.xlsx` - private pricing model

State that only the PDF is client-facing. Keep research notes, screenshots, rendered page images, source files, and tests out of the delivery set.
