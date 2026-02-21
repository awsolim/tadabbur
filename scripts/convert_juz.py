import json
import re
from pathlib import Path

# Arabic Surah names in canonical order (1..114)
SURAH_AR = [
    "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
    "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
    "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
    "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
    "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
    "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
    "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
    "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
    "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
    "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
    "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
    "المسد","الإخلاص","الفلق","الناس"
]

def normalize_ar_name(s: str) -> str:
    # NEW: remove tatweel and surrounding whitespace
    s = s.replace("ـ", "").strip()
    # NEW: remove all spaces for robust matching
    s = re.sub(r"\s+", "", s)
    # NEW: remove Arabic diacritics (harakat)
    s = re.sub(r"[\u064B-\u0652\u0670]", "", s)
    # NEW: normalize Alef forms
    s = s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    return s

SURAH_MAP = {normalize_ar_name(name): idx + 1 for idx, name in enumerate(SURAH_AR)}

def parse_ayahs(ayah_value) -> list[int]:
    # NEW: already a list
    if isinstance(ayah_value, list):
        return [int(x) for x in ayah_value]

    # NEW: already an int
    if isinstance(ayah_value, int):
        return [ayah_value]

    s = str(ayah_value).strip()
    # NEW: normalize dash variants to "-"
    s = s.replace("–", "-").replace("—", "-")
    nums = [int(n) for n in re.findall(r"\d+", s)]

    if not nums:
        return []

    # NEW: if it's a range like "84-85", expand inclusively
    if "-" in s and len(nums) >= 2:
        start, end = nums[0], nums[1]
        if end >= start:
            return list(range(start, end + 1))
        return nums

    return nums

def convert_file(input_path: Path, output_path: Path) -> None:
    data = json.loads(input_path.read_text(encoding="utf-8"))

    new_data = {"juz": data.get("juz"), "items": []}

    for item in data.get("items", []):
        ans = item.get("answer", {})

        surah_ar = str(ans.get("surah", ""))
        surah_num = SURAH_MAP.get(normalize_ar_name(surah_ar))

        if surah_num is None:
            raise ValueError(f"Unknown surah name: '{surah_ar}' in {input_path.name}")

        ayahs = parse_ayahs(ans.get("ayah"))

        new_item = {
            "qNum": item.get("qNum"),
            "question_ar": item.get("question_ar", ""),
            "question_en": item.get("question_en", ""),
            "answer": {
                "surah": surah_num,                    # NEW: numeric surah
                "ayahs": ayahs,                        # NEW: array of verse numbers
                "ayah_ar": ans.get("ayah_ar", ""),     # preserved
                "commentary_ar": ans.get("commentary_ar", ""),
                "commentary_en": ans.get("commentary_en", "")
            }
        }

        new_data["items"].append(new_item)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(new_data, ensure_ascii=False, indent=2), encoding="utf-8")

def main():
    # NEW: edit these paths if your structure differs
    input_dir = Path("public/data")
    output_dir = Path("public/data_v2")

    # NEW: convert all juz-*.json in one go
    for in_file in sorted(input_dir.glob("juz-*.json")):
        out_file = output_dir / in_file.name
        convert_file(in_file, out_file)
        print(f"Converted {in_file} -> {out_file}")

if __name__ == "__main__":
    main()