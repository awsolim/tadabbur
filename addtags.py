#!/usr/bin/env python3
"""
Add optional metadata fields to every question item in public/data/*.json

- Ensures each item has:
  - difficulty: ""   (easy|med|hard later)
  - theme: ""        (you can set later)
- Does NOT overwrite existing values.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


DATA_DIR = Path("public") / "data"


def ensure_fields(item: Dict[str, Any]) -> bool:
    """
    Ensure item has difficulty + theme keys.
    Returns True if the item was modified.
    """
    changed = False

    # NEW: add difficulty if missing
    if "difficulty" not in item:
        item["difficulty"] = ""  # NEW: default empty; you can set "easy|med|hard" later
        changed = True

    # NEW: add theme if missing
    if "theme" not in item:
        item["theme"] = ""  # NEW: default empty; you can set any theme string later
        changed = True

    return changed


def process_file(path: Path) -> bool:
    """
    Load a JSON file, update all items, and write back if changed.
    Returns True if the file was modified.
    """
    raw = path.read_text(encoding="utf-8")

    # NEW: parse JSON safely
    data = json.loads(raw)

    # NEW: handle both shapes:
    # 1) {"items":[...], ...}
    # 2) {"juz":..., "items":[...]}
    items = data.get("items")
    if not isinstance(items, list):
        print(f"Skipping (no items[]): {path.as_posix()}")
        return False

    file_changed = False

    for item in items:
        if isinstance(item, dict):
            if ensure_fields(item):
                file_changed = True

    if not file_changed:
        print(f"No changes: {path.as_posix()}")
        return False

    # NEW: write back with stable formatting and preserved Arabic
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",  # NEW: pretty + keep unicode
        encoding="utf-8",
    )

    print(f"Updated: {path.as_posix()}")
    return True


def main() -> None:
    if not DATA_DIR.exists():
        raise SystemExit(f"Folder not found: {DATA_DIR.as_posix()}")

    json_files = sorted(DATA_DIR.glob("*.json"))
    if not json_files:
        raise SystemExit(f"No .json files found in: {DATA_DIR.as_posix()}")

    modified_count = 0

    for path in json_files:
        if process_file(path):
            modified_count += 1

    print(f"\nDone. Modified {modified_count} file(s).")


if __name__ == "__main__":
    main()