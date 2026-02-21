import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadJuz } from "../lib/loadJuz";
import type { JuzData, TranslationData } from "../types";

/**
 * English + Arabic Surah name lookups by index (1..114).
 * Used to render references like "Surah Al-Baqarah — Ayah 45-46".
 */
const SURAH_EN = [
  "",
  "Al-Fatihah",
  "Al-Baqarah",
  "Aal-E-Imran",
  "An-Nisa",
  "Al-Ma'idah",
  "Al-An'am",
  "Al-A'raf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Ra'd",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
  "Al-Anbiya",
  "Al-Hajj",
  "Al-Mu'minun",
  "An-Nur",
  "Al-Furqan",
  "Ash-Shu'ara",
  "An-Naml",
  "Al-Qasas",
  "Al-Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Ash-Shura",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jathiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Adh-Dhariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqi'ah",
  "Al-Hadid",
  "Al-Mujadila",
  "Al-Hashr",
  "Al-Mumtahanah",
  "As-Saf",
  "Al-Jumu'ah",
  "Al-Munafiqun",
  "At-Taghabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Ma'arij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddaththir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba",
  "An-Nazi'at",
  "Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Inshiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-A'la",
  "Al-Ghashiyah",
  "Al-Fajr",
  "Al-Balad",
  "Ash-Shams",
  "Al-Layl",
  "Ad-Duha",
  "Ash-Sharh",
  "At-Tin",
  "Al-'Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-'Adiyat",
  "Al-Qari'ah",
  "At-Takathur",
  "Al-'Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraysh",
  "Al-Ma'un",
  "Al-Kawthar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas",
];

const SURAH_AR = [
  "",
  "الفاتحة",
  "البقرة",
  "آل عمران",
  "النساء",
  "المائدة",
  "الأنعام",
  "الأعراف",
  "الأنفال",
  "التوبة",
  "يونس",
  "هود",
  "يوسف",
  "الرعد",
  "إبراهيم",
  "الحجر",
  "النحل",
  "الإسراء",
  "الكهف",
  "مريم",
  "طه",
  "الأنبياء",
  "الحج",
  "المؤمنون",
  "النور",
  "الفرقان",
  "الشعراء",
  "النمل",
  "القصص",
  "العنكبوت",
  "الروم",
  "لقمان",
  "السجدة",
  "الأحزاب",
  "سبأ",
  "فاطر",
  "يس",
  "الصافات",
  "ص",
  "الزمر",
  "غافر",
  "فصلت",
  "الشورى",
  "الزخرف",
  "الدخان",
  "الجاثية",
  "الأحقاف",
  "محمد",
  "الفتح",
  "الحجرات",
  "ق",
  "الذاريات",
  "الطور",
  "النجم",
  "القمر",
  "الرحمن",
  "الواقعة",
  "الحديد",
  "المجادلة",
  "الحشر",
  "الممتحنة",
  "الصف",
  "الجمعة",
  "المنافقون",
  "التغابن",
  "الطلاق",
  "التحريم",
  "الملك",
  "القلم",
  "الحاقة",
  "المعارج",
  "نوح",
  "الجن",
  "المزمل",
  "المدثر",
  "القيامة",
  "الإنسان",
  "المرسلات",
  "النبأ",
  "النازعات",
  "عبس",
  "التكوير",
  "الانفطار",
  "المطففين",
  "الانشقاق",
  "البروج",
  "الطارق",
  "الأعلى",
  "الغاشية",
  "الفجر",
  "البلد",
  "الشمس",
  "الليل",
  "الضحى",
  "الشرح",
  "التين",
  "العلق",
  "القدر",
  "البينة",
  "الزلزلة",
  "العاديات",
  "القارعة",
  "التكاثر",
  "العصر",
  "الهمزة",
  "الفيل",
  "قريش",
  "الماعون",
  "الكوثر",
  "الكافرون",
  "النصر",
  "المسد",
  "الإخلاص",
  "الفلق",
  "الناس",
];

type LanguageMode = "Both" | "Arabic" | "English";

// NEW: local difficulty type (keeps this file working even if you haven't updated types.ts yet)
type Difficulty = "easy" | "med" | "hard"; // NEW

// NEW: map difficulty -> Tailwind badge classes
function getDifficultyClasses(difficulty: Difficulty) {
  if (difficulty === "easy") return "bg-emerald-50 text-emerald-700 border-emerald-200"; // NEW
  if (difficulty === "med") return "bg-amber-50 text-amber-700 border-amber-200"; // NEW
  return "bg-red-50 text-red-700 border-red-200"; // NEW ("hard")
}

/** Detect Arabic letters for bidi-safe rendering decisions. */
function hasArabicLetters(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

/** Create a friendly ayah label: "45" or "45-46" or "45, 47". */
function formatAyahsLabel(ayahs: number[]) {
  if (!ayahs || ayahs.length === 0) return "";
  const sorted = [...ayahs].sort((a, b) => a - b);

  const isConsecutive =
    sorted.length > 1 &&
    sorted.every((n, idx) => (idx === 0 ? true : n === sorted[idx - 1] + 1));

  if (isConsecutive) return `${sorted[0]}-${sorted[sorted.length - 1]}`;
  return sorted.join(", ");
}

function AyahToken({ inner }: { inner: string }) {
  return (
    <span
      className="quran-token"
      dir="rtl"
      style={{ unicodeBidi: "isolate-override", display: "inline-block" }}
    >
      {`﴿${inner}﴾`}
    </span>
  );
}

/** Render text that may contain ﴿...﴾ segments; only those segments get special styling. */
function renderWithAyahBrackets(text: string) {
  const parts = text.split(/(﴿.*?﴾)/g);

  return parts.map((part, i) => {
    const isAyahToken = part.startsWith("﴿") && part.endsWith("﴾");
    if (!isAyahToken) return <span key={i}>{part}</span>;

    const inner = part.slice(1, -1);
    return <AyahToken key={i} inner={inner} />;
  });
}

/**
 * Extract English translation for one or more ayahs from translation data.
 * Joins multiple verses with "\n" so it displays as multiple lines (whitespace-pre-line).
 */
function getEnglishAyahs(translation: TranslationData | null, surah: number, ayahs: number[]) {
  if (!translation) return "";
  const verses = (translation as any)[String(surah)];
  if (!Array.isArray(verses)) return "";

  const texts = ayahs
    .map((n) => verses.find((v: any) => v.verse === n)?.text ?? "")
    .filter(Boolean);

  return texts.join("\n");
}

export default function JuzPage() {
  const params = useParams();

  // Robust route param support (covers multiple route setups)
  const rawId =
    (params as any).id ?? (params as any).juz ?? (params as any).juzNumber ?? (params as any).num;

  // Compute a "juzKey" that can be number (1..30) OR string ("bonus")
  const juzKey = useMemo(() => {
    if (!rawId) return null;
    const s = String(rawId).trim();
    if (/^\d+$/.test(s)) return Number(s);
    return s;
  }, [rawId]);

  const [data, setData] = useState<JuzData | null>(null);
  const [translation, setTranslation] = useState<TranslationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageMode>("Both");

  // Multi-open accordion state (open many at once)
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set());

  const [search, setSearch] = useState("");

  // Load juz data (numeric) or bonus section (string)
  useEffect(() => {
    setError(null);
    setData(null);

    if (juzKey === null) {
      setError("Invalid Juz id in URL.");
      return;
    }

    loadJuz(juzKey)
      .then((result) => setData(result))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
        setError(msg);
      });
  }, [juzKey]);

  // Load translation (en.json)
  useEffect(() => {
    fetch("/quran/en.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load translation (en.json): ${res.status}`);
        return res.json();
      })
      .then((json) => setTranslation(json as TranslationData))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
        setError((prev) => prev ?? msg);
      });
  }, []);

  const headers = {
    answer: language === "Arabic" ? "الآية" : "Answer",
    translation: language === "Arabic" ? "الترجمة" : "Translation",
    explanation: language === "Arabic" ? "الشرح" : "Explanation",
  };

  const filtered = (data?.items ?? []).filter((item) => {
    const q = search.trim().toLowerCase();
    const qEn = (item.question_en ?? "").toLowerCase();
    const qAr = item.question_ar ?? "";
    return qEn.includes(q) || qAr.includes(search.trim());
  });

  // Toggle open/close for one question without affecting others
  function toggleOpen(index: number) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (!data && !error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading…</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900 transition">
            ← Back to List
          </Link>

          <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="font-semibold text-red-700">Failed to load</div>
            <div className="mt-2 text-sm text-slate-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Nicer title for the bonus section
  const pageTitle =
    typeof juzKey === "string" && juzKey.trim().toLowerCase() === "bonus"
      ? "Outstanding Questions"
      : `Juz ${data?.juz}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition">
            ← Back to List
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Language</span>

            <button
              onClick={() => setLanguage("Both")}
              className={
                language === "Both"
                  ? "px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-sm"
                  : "px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
              }
            >
              Both
            </button>

            <button
              onClick={() => setLanguage("Arabic")}
              className={
                language === "Arabic"
                  ? "px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-sm"
                  : "px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
              }
            >
              Arabic
            </button>

            <button
              onClick={() => setLanguage("English")}
              className={
                language === "English"
                  ? "px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-sm"
                  : "px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition"
              }
            >
              English
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{pageTitle}</h1>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within this section…"
            className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Items */}
        <div className="space-y-5">
          {filtered.map((item: any, index) => {
            const isOpen = openSet.has(index);

            const hasExplanation =
              Boolean(item.answer.commentary_ar?.trim()) || Boolean(item.answer.commentary_en?.trim());

            // Resolve reference info safely (surah can be null in some datasets)
            const surahNum = item.answer.surah;
            const ayahNums = item.answer.ayahs ?? [];
            const ayahsLabel = formatAyahsLabel(ayahNums);

            const surahEnName = surahNum == null ? "" : SURAH_EN[surahNum] ?? `Surah ${surahNum}`;
            const surahArName = surahNum == null ? "" : SURAH_AR[surahNum] ?? "";

            const refEn = surahNum == null ? "" : `Surah ${surahEnName} — Ayah ${ayahsLabel}`;
            const refAr = surahNum == null ? "" : `سورة ${surahArName} — الآية ${ayahsLabel}`;

            const englishAyahs =
              surahNum == null || ayahNums.length === 0 ? "" : getEnglishAyahs(translation, surahNum, ayahNums);

            const ayahArRaw = item.answer.ayah_ar ?? "";

            // NEW: read optional tags from JSON
            const difficulty = (item.difficulty ?? "").trim().toLowerCase() as Difficulty | ""; // NEW
            const theme = (item.theme ?? "").trim(); // NEW

            return (
              <div
                key={item.qNum}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full text-left px-5 py-4 hover:bg-slate-50 transition flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    {/* NEW: Q number row + tags */}
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500">Q{item.qNum}</div>

                      {/* NEW: difficulty badge (optional) */}
                      {difficulty && (difficulty === "easy" || difficulty === "med" || difficulty === "hard") && (
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full border ${getDifficultyClasses(
                            difficulty
                          )}`}
                        >
                          {difficulty}
                        </span>
                      )}

                      {/* NEW: theme badge (optional, always blue styling) */}
                      {theme && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                          {theme}
                        </span>
                      )}
                    </div>

                    {(language === "English" || language === "Both") && (
                      <div className="text-sm font-semibold text-slate-900 leading-6">
                        {item.question_en}
                      </div>
                    )}

                    {(language === "Arabic" || language === "Both") && (
                      <div
                        className="text-sm font-semibold text-slate-900 leading-7"
                        dir="rtl"
                        style={{ unicodeBidi: "plaintext" }}
                      >
                        {item.question_ar}
                      </div>
                    )}
                  </div>

                  <div className="text-slate-400 text-sm">{isOpen ? "−" : "+"}</div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-5">
                    {/* Answer (Arabic + English translation in their own boxed areas) */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-500">{headers.answer}</div>

                      {/* Arabic Ayah box (bigger, boxed) */}
                      {(language === "Arabic" || language === "Both") && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <div
                            className="text-lg leading-9 text-slate-900 whitespace-pre-line"
                            dir={hasArabicLetters(ayahArRaw) ? "rtl" : "ltr"}
                            style={{ unicodeBidi: "plaintext" }}
                          >
                            {renderWithAyahBrackets(ayahArRaw)}
                          </div>

                          {/* Arabic ref goes at the VERY end of the Arabic box */}
                          {refAr && (
                            <div className="mt-3 text-xs text-slate-500" dir="rtl" style={{ unicodeBidi: "plaintext" }}>
                              {refAr}
                            </div>
                          )}
                        </div>
                      )}

                      {/* English translation box (boxed), with ref at end */}
                      {(language === "English" || language === "Both") && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="text-xs font-semibold text-slate-500 mb-2">
                            {headers.translation}
                          </div>

                          <div className="text-sm text-slate-800 whitespace-pre-line">
                            {englishAyahs}
                          </div>

                          {/* English ref goes at the VERY end of the English translation box */}
                          {refEn && <div className="mt-3 text-xs text-slate-500">{refEn}</div>}
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    {hasExplanation && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-500">{headers.explanation}</div>

                        {(language === "English" || language === "Both") && (
                          <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="text-sm text-slate-800 whitespace-pre-line">
                              {item.answer.commentary_en}
                            </div>
                          </div>
                        )}

                        {(language === "Arabic" || language === "Both") && (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div
                              className="text-sm text-slate-800 whitespace-pre-line leading-7"
                              dir="rtl"
                              style={{ unicodeBidi: "plaintext" }}
                            >
                              {item.answer.commentary_ar ?? ""}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}