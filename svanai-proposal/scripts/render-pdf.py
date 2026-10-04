#!/usr/bin/env python3
"""Render proposal HTML to PDF with an installed Chromium-family browser."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.parse import quote


def browser_candidates() -> list[Path]:
    candidates: list[Path] = []
    for env_name in ("CHROME_PATH", "CHROMIUM_PATH", "EDGE_PATH"):
        if os.environ.get(env_name):
            candidates.append(Path(os.environ[env_name]))
    for command in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome", "msedge"):
        found = shutil.which(command)
        if found:
            candidates.append(Path(found))
    if os.name == "nt":
        roots = [os.environ.get("ProgramFiles"), os.environ.get("ProgramFiles(x86)"), os.environ.get("LOCALAPPDATA")]
        relative = [
            Path("Google/Chrome/Application/chrome.exe"),
            Path("Microsoft/Edge/Application/msedge.exe"),
        ]
        for root in filter(None, roots):
            for suffix in relative:
                candidates.append(Path(root) / suffix)
    else:
        candidates.extend(
            [
                Path("/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"),
                Path("/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
            ]
        )
    deduped = []
    seen = set()
    for candidate in candidates:
        key = str(candidate).lower()
        if key not in seen and candidate.exists():
            deduped.append(candidate)
            seen.add(key)
    return deduped


def to_windows_path(path: Path) -> str:
    result = subprocess.run(["wslpath", "-w", str(path)], check=True, capture_output=True, text=True)
    return result.stdout.strip()


def windows_file_uri(path: Path) -> str:
    windows_path = to_windows_path(path).replace("\\", "/")
    return "file:///" + quote(windows_path, safe="/:()")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("html", type=Path)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--browser", type=Path)
    args = parser.parse_args()

    html_path = args.html.resolve()
    pdf_path = args.pdf.resolve()
    if not html_path.exists():
        raise SystemExit(f"HTML input does not exist: {html_path}")
    browsers = [args.browser] if args.browser else browser_candidates()
    browser = next((item for item in browsers if item and item.exists()), None)
    if browser is None:
        raise SystemExit("No Chrome, Chromium, or Edge executable found. Set CHROME_PATH.")

    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    is_windows_exe_from_wsl = os.name != "nt" and browser.suffix.lower() == ".exe"
    if is_windows_exe_from_wsl:
        html_uri = windows_file_uri(html_path)
        pdf_arg = to_windows_path(pdf_path)
    else:
        html_uri = html_path.as_uri()
        pdf_arg = str(pdf_path)

    cache_root = pdf_path.parent / ".svanai-render-cache"
    cache_root.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="chrome-", dir=cache_root) as profile:
        profile_arg = to_windows_path(Path(profile)) if is_windows_exe_from_wsl else profile
        command = [
            str(browser),
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-software-rasterizer",
            "--disable-gpu-compositing",
            "--use-gl=disabled",
            "--disable-crash-reporter",
            "--disable-breakpad",
            "--disable-background-networking",
            "--disable-default-apps",
            "--disable-extensions",
            "--disable-sync",
            "--no-first-run",
            "--disable-features=UseSkiaRenderer,Vulkan,AcceleratedVideoDecode,AcceleratedVideoEncode,CanvasOopRasterization,Crashpad",
            "--allow-file-access-from-files",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=2000",
            f"--user-data-dir={profile_arg}",
            f"--print-to-pdf={pdf_arg}",
            html_uri,
        ]
        process_env = os.environ.copy()
        if os.name == "nt":
            process_env.update({"LOCALAPPDATA": profile, "TEMP": profile, "TMP": profile})
        result = subprocess.run(command, capture_output=True, text=True, timeout=120, env=process_env)
        if result.returncode != 0:
            raise SystemExit(result.stderr or result.stdout or f"Browser exited with {result.returncode}")

    for _ in range(20):
        if pdf_path.exists() and pdf_path.stat().st_size > 0:
            break
        time.sleep(0.25)
    if not pdf_path.exists() or pdf_path.stat().st_size == 0:
        raise SystemExit(f"Browser did not create PDF: {pdf_path}")
    print(f"Rendered {pdf_path} with {browser}")


if __name__ == "__main__":
    main()
