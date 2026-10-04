# Private pricing model

## Separation rule

Keep internal employee costs, fallback company cost, target margin, contingency logic, discount logic, and pricing comparisons in `pricing.xlsx`. Show only the user-selected client price and approved client-facing breakdown in the PDF.

## Inputs

- phases, roles, descriptions, and hours
- internal role cost; use company cost when a role rate is absent
- project-management hours and percentage estimate
- selected PM method
- target margin
- contingency percentage
- discount percentage
- fixed value-based price
- selected pricing model
- tax rate and currency

Role rates are internal costs. A client billing rate is a separate derived presentation value.

## Calculations

Use these definitions:

```text
delivery cost = sum(hours × internal role cost)
PM hours cost = PM hours × applicable internal cost
PM percentage cost = delivery cost × PM percentage
selected PM cost = the user-selected PM method
cost subtotal = delivery cost + selected PM cost
contingency = cost subtotal × contingency percentage
cost base = cost subtotal + contingency
cost-derived price before discount = cost base ÷ (1 - target margin)
cost-derived price = cost-derived price before discount × (1 - discount)
value-based price = fixed value price × (1 - discount)
selected client price = the model selected by the user
tax = selected client price × tax rate
grand total = selected client price + tax
```

Interpret target margin as gross margin on client price, not markup on cost. Require explicit user approval if another definition is intended.

## Client phase allocation

Allocate the selected client price across phases using approved billable hours or another user-approved allocation. If hours drive allocation:

```text
blended client rate = selected client price ÷ total client-facing hours
phase amount = phase hours × blended client rate
```

Reconcile rounding in the final phase so phase amounts equal the selected client price exactly.

## Build the workbook

Use the bundled `scripts/build-pricing.mjs`; do not hand-edit calculated workbook cells.

1. Call `codex_app__load_workspace_dependencies` and locate the bundled Node.js executable and `node_modules` directory.
2. Create a working directory outside the installed skill. Copy `scripts/build-pricing.mjs` into it and make its `node_modules` entry a junction or symlink to the bundled dependency directory so the ESM import for `@oai/artifact-tool` resolves.
3. Prepare the private pricing input JSON from confirmed intake values. Keep it outside the four client-project deliverables.
4. Run `node build-pricing.mjs --input pricing-input.json --output pricing.xlsx --preview-dir pricing-previews` from the working directory.
5. Inspect the workbook with the spreadsheet inspection utility, scan every formula for errors, and render every sheet to PNG. Correct and repeat until the Checks sheet is `PASS` and every sheet is visually clean.

The workbook is private. Never attach it to the proposal PDF or expose internal rates, margins, pricing alternatives, contingency mechanics, or discount mechanics in client-facing prose.

## Controls

The workbook status is `PASS` only when:

- every row has a phase, role, description, and non-negative hours;
- every row resolves an internal rate;
- target margin is below 100%;
- contingency and discount are between 0% and 100%;
- selected price is non-negative;
- client phase amounts reconcile to selected price;
- tax and grand total reconcile;
- selected price matches every proposal occurrence.
