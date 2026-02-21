import os
import json
import shutil

DATA_DIR = "public/data"

# Character flip mapping
FLIP_MAP = {
    # "(": ")",
    # ")": "(",
    "﴿": "﴾",
    "﴾": "﴿",
}

def flip_parentheses(text: str) -> str:
    """Flip all parentheses characters using FLIP_MAP."""
    return "".join(FLIP_MAP.get(ch, ch) for ch in text)


def process_json_file(path: str):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict) or "items" not in data:
        return

    modified = False

    for item in data["items"]:
        if "question_en" in item and isinstance(item["question_en"], str):
            original = item["question_en"]
            flipped = flip_parentheses(original)

            if flipped != original:
                item["question_en"] = flipped
                modified = True

    if modified:
        backup_path = path + ".bak"
        shutil.copy2(path, backup_path)  # backup original

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Updated: {path}")
    else:
        print(f"No changes: {path}")


def main():
    for root, _, files in os.walk(DATA_DIR):
        for file in files:
            if file.endswith(".json"):
                full_path = os.path.join(root, file)
                process_json_file(full_path)


if __name__ == "__main__":
    main()