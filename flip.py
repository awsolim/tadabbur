import json
from pathlib import Path

# Path to your data folder
DATA_DIR = Path("public/data")

# All characters to remove from ayah_ar
CHARS_TO_REMOVE = {
    "(", ")",            # normal parentheses
    "（", "）",          # fullwidth
    "﹙", "﹚",          # small variants
    "⁽", "⁾",           # superscript
    "₍", "₎",           # subscript
    "﴿", "﴾",           # Quranic brackets
}

def clean_text(text: str) -> str:
    """Remove all configured characters from text."""
    return "".join(ch for ch in text if ch not in CHARS_TO_REMOVE)

def process_file(path: Path) -> bool:
    """Remove parentheses/brackets from answer.ayah_ar in one file."""
    raw = path.read_text(encoding="utf-8")
    data = json.loads(raw)

    changed = False

    items = data.get("items")
    if not isinstance(items, list):
        return False

    for item in items:
        if not isinstance(item, dict):
            continue

        answer = item.get("answer")
        if not isinstance(answer, dict):
            continue

        ayah_ar = answer.get("ayah_ar")

        if isinstance(ayah_ar, str) and ayah_ar:
            cleaned = clean_text(ayah_ar)
            if cleaned != ayah_ar:
                answer["ayah_ar"] = cleaned
                changed = True

    if changed:
        path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8"
        )

    return changed

def main():
    if not DATA_DIR.exists():
        raise SystemExit(f"Data folder not found: {DATA_DIR.resolve()}")

    files = sorted(DATA_DIR.rglob("*.json"))
    if not files:
        print("No JSON files found.")
        return

    changed_count = 0

    for file in files:
        try:
            if process_file(file):
                changed_count += 1
                print(f"Updated: {file}")
        except json.JSONDecodeError as e:
            print(f"Skipped (invalid JSON): {file} -> {e}")

    print(f"\nDone. Updated {changed_count} file(s) out of {len(files)} total.")

if __name__ == "__main__":
    main()