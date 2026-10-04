# Proposal JSON contract

Start from `assets/proposal-template.json`. Keep the top-level structure:

```json
{
  "document": {
    "proposal_type": "...",
    "version_date": "...",
    "status": "DRAFT / INDICATIVE",
    "currency": "INR",
    "currency_note": "Exclusive of applicable taxes",
    "proposal_basis": "...",
    "basis_note": "..."
  },
  "cover": {
    "title": "...",
    "accent_title": "...",
    "subtitle": "...",
    "metadata": [{"label": "...", "value": "...", "note": "..."}],
    "note_title": "...",
    "note": "..."
  },
  "pages": [{"number": "01", "title": "...", "dense": false, "blocks": []}]
}
```

Set `dense` to `true` only when visual inspection proves the standard spacing cannot fit a legitimate dense page. Prefer splitting the page first. Use these block contracts:

```json
{"type":"text","text":"...","lead":true}
{"type":"bullets","title":"Optional","items":["..."]}
{"type":"cards","title":"Optional","columns":3,"tone":"green","items":[{"kicker":"01","title":"...","body":"..."}]}
{"type":"columns","title":"Optional","columns":2,"items":[{"title":"...","tone":"green","items":["..."]},{"title":"...","blocks":[{"type":"text","text":"..."}]}]}
{"type":"table","title":"Optional","headers":["..."],"rows":[["..."]],"numeric_columns":[2],"widths":[45,35,20],"compact":true}
{"type":"callout","title":"...","text":"..."}
{"type":"timeline","title":"Optional","columns":4,"items":[{"kicker":"Phase 1","title":"...","duration":"2 weeks"}]}
{"type":"packages","title":"Optional","columns":2,"items":[{"title":"...","subtitle":"...","price":"500,000","currency":"INR","features":["..."],"recommended":true}]}
{"type":"milestones","title":"Optional","columns":4,"items":[{"value":"40%","title":"Kick-off","body":"On signature"}]}
{"type":"steps","title":"Optional","columns":4,"items":[{"number":"1","title":"Confirm scope"}]}
{"type":"spacer","size":"sm"}
```

Allowed spacer sizes are `sm`, `md`, and `lg`. Package blocks are forbidden unless the branch intake explicitly approves packages. Numeric table columns are zero-indexed, and table widths are percentages that should total 100.
