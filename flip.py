#!/usr/bin/env python3
"""
Swap Qur'anic brackets in BOTH directions ONLY inside answer.commentary_en
across all Juz JSON files in your v2 directory.

This flips every instance:
  ﴿  <->  ﴾

So:
  ﴿text﴾ becomes ﴾text﴿
  ﴾text﴿ becomes ﴿text﴾

Nothing else is modified (no Arabic/ayah fields, no commentary_ar, etc.).
"""

from __future__ import annotations  # NEW: allows modern typing on older Python versions

import json  # NEW: read/write JSON
from pathlib import Path  # NEW: cross-platform paths
from typing import Any, Dict  # NEW: type hints


# NEW: Unicode Qur'anic brackets
OPEN_BRACKET = "﴿"  # NEW: U+FD3F
CLOSE_BRACKET = "﴾"  # NEW: U+FD3E
TMP = "\uE000"  # NEW: private-use temporary placeholder unlikely to exist in text


def swap_quranic_brackets(text: str) -> tuple[str, int]:
    """
    Swap all ﴿ and ﴾ characters in a string.
    Returns (new_text, number_of_swaps_performed).
    """
    if OPEN_BRACKET not in text and CLOSE_BRACKET not in text:
        return text, 0  # NEW: fast exit if nothing to swap

    # NEW: count how many bracket characters exist (each one will flip)
    swaps = text.count(OPEN_BRACKET) + text.count(CLOSE_BRACKET)

    # NEW: three-step replace avoids clobbering (classic swap technique)
    swapped = (
        text.replace(OPEN_BRACKET, TMP)  # NEW: park all openings into TMP
        .replace(CLOSE_BRACKET, OPEN_BRACKET)  # NEW: turn closings into openings
        .replace(TMP, CLOSE_BRACKET)  # NEW: turn parked openings into closings
    )

    return swapped, swaps


def main() -> None:
    v2_dir = Path("public/data")  # NEW: adjust if your folder name differs
    if not v2_dir.exists() or not v2_dir.is_dir():
        raise SystemExit(f"Directory not found: {v2_dir.resolve()}")

    backup_dir = v2_dir.parent / f"{v2_dir.name}_backup"  # NEW: backup sibling folder
    backup_dir.mkdir(exist_ok=True)  # NEW: ensure backup folder exists

    files_changed = 0  # NEW: number of JSON files modified
    total_swaps = 0  # NEW: total bracket characters flipped across all files

    for path in sorted(v2_dir.glob("*.json")):
        raw = path.read_text(encoding="utf-8")  # NEW: read with UTF-8 for Arabic
        try:
            data: Dict[str, Any] = json.loads(raw)  # NEW: parse JSON
        except Exception as e:
            print(f"[SKIP] {path.name}: invalid JSON ({e})")
            continue

        items = data.get("items")
        if not isinstance(items, list):
            print(f"[SKIP] {path.name}: missing/invalid 'items' array")
            continue

        file_swaps = 0  # NEW: count swaps in this file

        for item in items:
            if not isinstance(item, dict):
                continue  # NEW: skip invalid entries safely

            answer = item.get("answer")
            if not isinstance(answer, dict):
                continue  # NEW: skip if missing/invalid

            ce = answer.get("commentary_en")
            if not isinstance(ce, str) or not ce:
                continue  # NEW: nothing to edit

            swapped, n = swap_quranic_brackets(ce)  # NEW: swap brackets in this string
            if n:
                answer["commentary_en"] = swapped  # NEW: write back ONLY this field
                file_swaps += n  # NEW: track per-file swaps

        if file_swaps:
            # NEW: save original file into backup folder (overwrites backup on rerun for simplicity)
            (backup_dir / path.name).write_text(raw, encoding="utf-8")

            # NEW: write updated JSON back (preserve Arabic chars)
            path.write_text(
                json.dumps(data, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

            files_changed += 1
            total_swaps += file_swaps
            print(f"[UPDATED] {path.name}: flipped {file_swaps} bracket char(s) in commentary_en")

    print("\nDone.")
    print(f"Files changed: {files_changed}")
    print(f"Total bracket chars flipped: {total_swaps}")
    print(f"Backups saved to: {backup_dir.resolve()}")


if __name__ == "__main__":
    main()  # NEW: standard entrypoint