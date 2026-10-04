# Intake and evidence ledger

## Intake behavior

1. Inspect all supplied sources before questioning the user.
2. Ask whether to research the client and industry. Research only after consent.
3. Extract every available field and record its source.
4. Mark each value `confirmed`, `derived`, `assumption`, or `TBC`.
5. Surface conflicts and low-confidence interpretations.
6. Ask 3-5 related questions per round until every applicable field is addressed.
7. Show a consolidated brief and obtain approval before composition.

If the user supplies only a short prompt, treat it as an empty brief and interview from the first category. Do not infer commercial or legal choices from silence.

## Evidence statuses

- `confirmed`: stated or approved by the user, or unambiguously present in an authoritative source.
- `derived`: calculated or directly inferred from confirmed inputs; record the derivation.
- `assumption`: reasonable but unconfirmed; show it visibly in drafts.
- `TBC`: unavailable or unresolved.

Research findings remain `derived` until the user confirms them. Never invent metrics, case studies, client facts, POC results, dates, rates, or legal requirements.

## Intake categories

### Proposal

- engagement branch and prior-POC context
- project name and subtitle
- version, issue date, validity, and status
- currency and tax treatment

### Client

- legal entity, recipient, role, email, and location
- country and relevant regulatory context
- decision-makers, reviewers, and procurement constraints

### Business

- background and current workflow
- pain points and measurable impacts
- objectives, desired outcomes, and urgency
- discovery or POC evidence
- approved metrics and claims

### Solution

- solution vision, modules, features, integrations, and outputs
- users, volumes, deployment environment, and constraints
- technical detail required for this audience

### Scope and acceptance

- included deliverables and priorities
- explicit exclusions
- assumptions and dependencies
- client responsibilities
- acceptance measures, validation set, UAT, approver, and sign-off

### Delivery

- phases, activities, durations, dependencies, and target dates
- client involvement, governance, handover, warranty, and support

### Commercial

- pricing mode, package choice, and client presentation
- roles, hours, internal rates, fallback company rate, PM inputs
- target margin, contingency, discount, and value-based price
- taxes, payment milestones, recurring or third-party costs

### Legal

- IP mode
- international adaptation needs
- confidentiality, data ownership, liability, termination, taxes, validity, and governing law confirmations

### Evidence and positioning

- SvanAI differentiators relevant to this client
- approved case studies, proof points, results, and references

## Optional source documents

Accept any combination of client emails, RFP/RFQ files, meeting transcripts, discovery notes, POC reports, PRDs, backlogs, architecture/API documentation, workflow samples, pricing sheets, prior proposals, and contract terms. A document is evidence, not permission to copy unsupported claims or confidential details into the final proposal.
