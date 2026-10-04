#!/usr/bin/env python3
"""Build a branded svanAI proposal HTML file from a structured JSON payload."""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path
from typing import Any


SKILL_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = SKILL_DIR / "assets"


def clean_text(value: Any) -> str:
    text = str(value if value is not None else "")
    return (
        text.replace("\u00a0", " ")
        .replace("\u2010", "-")
        .replace("\u2011", "-")
        .replace("\u2012", "-")
        .replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2212", "-")
    )


def inline(value: Any) -> str:
    escaped = html.escape(clean_text(value), quote=True)
    escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
    return escaped.replace("\n", "<br>")


def block_title(value: str | None) -> str:
    return f'<h2 class="block-title">{inline(value)}</h2>' if value else ""


def render_text(block: dict[str, Any]) -> str:
    class_name = "lead" if block.get("lead") else ""
    return f'<div class="block"><p class="{class_name}">{inline(block.get("text", ""))}</p></div>'


def render_cards(block: dict[str, Any]) -> str:
    items = []
    tone = clean_text(block.get("tone", ""))
    for item in block.get("items", []):
        body = f'<div class="card-body">{inline(item.get("body", ""))}</div>' if item.get("body") else ""
        kicker = f'<div class="card-kicker">{inline(item.get("kicker", ""))}</div>' if item.get("kicker") else ""
        items.append(
            f'<article class="card {html.escape(tone)}">{kicker}'
            f'<div class="card-title">{inline(item.get("title", ""))}</div>{body}</article>'
        )
    cols = max(1, min(5, int(block.get("columns", 2))))
    return f'<section class="block">{block_title(block.get("title"))}<div class="cards" style="--cols:{cols}">{"".join(items)}</div></section>'


def render_bullets(block: dict[str, Any]) -> str:
    items = "".join(f"<li>{inline(item)}</li>" for item in block.get("items", []))
    return f'<section class="block">{block_title(block.get("title"))}<ul class="clean">{items}</ul></section>'


def render_columns(block: dict[str, Any]) -> str:
    columns = []
    for column in block.get("items", []):
        nested = "".join(render_block(item) for item in column.get("blocks", []))
        if column.get("items"):
            nested += render_bullets({"type": "bullets", "items": column["items"]})
        tone = html.escape(clean_text(column.get("tone", "")))
        columns.append(
            f'<article class="column-panel {tone}"><h3 class="column-title">'
            f'{inline(column.get("title", ""))}</h3>{nested}</article>'
        )
    cols = max(1, min(3, int(block.get("columns", len(columns) or 2))))
    return f'<section class="block">{block_title(block.get("title"))}<div class="columns" style="--cols:{cols}">{"".join(columns)}</div></section>'


def render_table(block: dict[str, Any]) -> str:
    headers = block.get("headers", [])
    rows = block.get("rows", [])
    numeric = {int(index) for index in block.get("numeric_columns", [])}
    widths = block.get("widths", [])
    colgroup = ""
    if widths:
        colgroup = "<colgroup>" + "".join(f'<col style="width:{float(width):g}%">' for width in widths) + "</colgroup>"
    head = "".join(f'<th class="{"numeric" if index in numeric else ""}">{inline(value)}</th>' for index, value in enumerate(headers))
    body_rows = []
    for row in rows:
        cells = "".join(
            f'<td class="{"numeric" if index in numeric else ""}">{inline(value)}</td>'
            for index, value in enumerate(row)
        )
        body_rows.append(f"<tr>{cells}</tr>")
    compact = " compact" if block.get("compact") else ""
    return (
        f'<section class="block">{block_title(block.get("title"))}'
        f'<table class="{compact.strip()}">{colgroup}<thead><tr>{head}</tr></thead>'
        f'<tbody>{"".join(body_rows)}</tbody></table></section>'
    )


def render_callout(block: dict[str, Any]) -> str:
    title = f'<div class="callout-title">{inline(block.get("title", ""))}</div>' if block.get("title") else ""
    return f'<aside class="block callout">{title}<p>{inline(block.get("text", ""))}</p></aside>'


def render_timeline(block: dict[str, Any]) -> str:
    items = []
    for index, item in enumerate(block.get("items", []), start=1):
        items.append(
            '<article class="phase">'
            f'<div class="phase-kicker">{inline(item.get("kicker", f"Phase {index}"))}</div>'
            f'<div class="phase-title">{inline(item.get("title", ""))}</div>'
            f'<div class="phase-duration">{inline(item.get("duration", ""))}</div></article>'
        )
    cols = max(1, min(6, int(block.get("columns", len(items) or 5))))
    return f'<section class="block">{block_title(block.get("title"))}<div class="timeline" style="--cols:{cols}">{"".join(items)}</div></section>'


def render_packages(block: dict[str, Any]) -> str:
    packages = []
    for item in block.get("items", []):
        recommended = bool(item.get("recommended"))
        badge = '<div class="recommendation">Recommended</div>' if recommended else ""
        features = "".join(f"<li>{inline(feature)}</li>" for feature in item.get("features", []))
        packages.append(
            f'<article class="package {"recommended" if recommended else ""}">{badge}'
            f'<div class="package-title">{inline(item.get("title", ""))}</div>'
            f'<div class="package-subtitle">{inline(item.get("subtitle", ""))}</div>'
            f'<div class="price">{inline(item.get("price", ""))} <small>{inline(item.get("currency", ""))}</small></div>'
            f'<ul class="clean">{features}</ul></article>'
        )
    cols = max(1, min(3, int(block.get("columns", len(packages) or 2))))
    return f'<section class="block">{block_title(block.get("title"))}<div class="packages" style="--cols:{cols}">{"".join(packages)}</div></section>'


def render_milestones(block: dict[str, Any]) -> str:
    items = []
    for item in block.get("items", []):
        items.append(
            '<article class="milestone">'
            f'<div class="milestone-value">{inline(item.get("value", ""))}</div>'
            f'<div class="milestone-title">{inline(item.get("title", ""))}</div>'
            f'<div class="milestone-body">{inline(item.get("body", ""))}</div></article>'
        )
    cols = max(1, min(5, int(block.get("columns", len(items) or 4))))
    return f'<section class="block">{block_title(block.get("title"))}<div class="milestones" style="--cols:{cols}">{"".join(items)}</div></section>'


def render_steps(block: dict[str, Any]) -> str:
    items = []
    for index, item in enumerate(block.get("items", []), start=1):
        items.append(
            '<article class="step">'
            f'<div class="step-number">{inline(item.get("number", index))}</div>'
            f'<div class="step-title">{inline(item.get("title", ""))}</div></article>'
        )
    cols = max(1, min(6, int(block.get("columns", len(items) or 4))))
    return f'<section class="block">{block_title(block.get("title"))}<div class="steps" style="--cols:{cols}">{"".join(items)}</div></section>'


def render_block(block: dict[str, Any]) -> str:
    block_type = block.get("type")
    renderers = {
        "text": render_text,
        "cards": render_cards,
        "bullets": render_bullets,
        "columns": render_columns,
        "table": render_table,
        "callout": render_callout,
        "timeline": render_timeline,
        "packages": render_packages,
        "milestones": render_milestones,
        "steps": render_steps,
    }
    if block_type == "spacer":
        size = block.get("size", "md")
        if size not in {"sm", "md", "lg"}:
            size = "md"
        return f'<div class="spacer-{size}"></div>'
    if block_type not in renderers:
        raise ValueError(f"Unsupported block type: {block_type!r}")
    return renderers[block_type](block)


def render_wordmark() -> str:
    return '<div class="wordmark"><span>svan</span><span class="ai">AI</span></div>'


def render_cover(data: dict[str, Any], total_pages: int) -> str:
    document = data["document"]
    cover = data["cover"]
    cards = []
    for card in cover.get("cards", []):
        note = f'<div class="meta-note">{inline(card.get("note", ""))}</div>' if card.get("note") else ""
        cards.append(
            '<article class="meta-card">'
            f'<div class="meta-label">{inline(card.get("label", ""))}</div>'
            f'<div class="meta-value">{inline(card.get("value", ""))}</div>{note}</article>'
        )
    note_title = f'<div class="eyebrow">{inline(cover.get("note_title", ""))}</div>' if cover.get("note_title") else ""
    return f'''<section class="page cover">
      <div class="cover-top">{render_wordmark()}<div class="site">SVANAI.COM</div></div>
      <main class="cover-main">
        <div class="cover-kicker">{inline(document.get("proposal_type", "COMMERCIAL PROPOSAL"))} · {inline(document.get("version_date", ""))}</div>
        <h1>{inline(cover.get("title", ""))}<span class="accent">{inline(cover.get("accent_title", ""))}</span></h1>
        <p class="cover-subtitle">{inline(cover.get("subtitle", ""))}</p>
        <div class="meta-grid">{"".join(cards)}</div>
        <aside class="cover-note">{note_title}{inline(cover.get("note", ""))}</aside>
      </main>
      <footer class="cover-footer"><div class="footer-text">SVANAI TECHNOLOGIES LLP</div><div class="footer-text">CONFIDENTIAL - FOR RECIPIENT USE ONLY</div></footer>
    </section>'''


def render_page(page: dict[str, Any], document: dict[str, Any], page_number: int, total_pages: int) -> str:
    blocks = "".join(render_block(block) for block in page.get("blocks", []))
    header_label = document.get("header_label", document.get("proposal_type", "COMMERCIAL PROPOSAL"))
    density_class = " dense" if page.get("dense") else ""
    return f'''<section class="page interior{density_class}">
      <header class="interior-header">{render_wordmark()}<div class="document-label">{inline(header_label)}</div></header>
      <main class="page-content">
        <div class="title-row"><div class="badge">{inline(page.get("number", page_number - 1))}</div><h1>{inline(page.get("title", ""))}</h1><div class="title-rule"></div></div>
        {blocks}
      </main>
      <footer class="interior-footer"><div class="footer-text">SVANAI TECHNOLOGIES LLP · {inline(header_label)}</div><div class="footer-text">CONFIDENTIAL · SVANAI.COM · PAGE {page_number} OF {total_pages}</div></footer>
    </section>'''


def validate(data: dict[str, Any]) -> None:
    for key in ("document", "cover", "pages"):
        if key not in data:
            raise ValueError(f"Missing top-level key: {key}")
    if not isinstance(data["pages"], list) or not data["pages"]:
        raise ValueError("pages must contain at least one interior page")
    status = clean_text(data["document"].get("status", "")).upper()
    if "FINAL" in status:
        serialized = json.dumps(data, ensure_ascii=False).upper()
        markers = [marker for marker in ("TBC", "[ASSUMPTION]", "{{", "}}") if marker in serialized]
        if markers:
            raise ValueError(f"Client-ready final contains unresolved markers: {', '.join(markers)}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="Proposal JSON payload")
    parser.add_argument("output", type=Path, help="Output HTML path")
    args = parser.parse_args()

    data = json.loads(args.input.read_text(encoding="utf-8"))
    validate(data)
    css = (ASSETS_DIR / "proposal.css").read_text(encoding="utf-8")
    css = css.replace("__ASSET_URI__", ASSETS_DIR.as_uri())
    total_pages = 1 + len(data["pages"])
    pages = [render_cover(data, total_pages)]
    pages.extend(
        render_page(page, data["document"], index, total_pages)
        for index, page in enumerate(data["pages"], start=2)
    )
    title = f'{clean_text(data["cover"].get("title", "svanAI Proposal"))} - svanAI'
    output = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>{css}</style>
</head>
<body>{"".join(pages)}</body>
</html>'''
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(output, encoding="utf-8")
    print(f"Built {args.output} with {total_pages} pages")


if __name__ == "__main__":
    main()
