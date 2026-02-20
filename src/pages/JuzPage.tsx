import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadJuz } from "../lib/loadJuz";
import type { JuzData } from "../types";

type LanguageMode = "Both" | "Arabic" | "English";

/**
 * NEW: Detect Arabic letters.
 * Used to decide whether a ﴿...﴾ segment is Arabic (RTL) or English (LTR).
 */
function hasArabicLetters(text: string) {
  return /[\u0600-\u06FF]/.test(text); // NEW: Arabic unicode range
}

/**
 * NEW: A tiny, consistent renderer for ayah-bracket segments.
 * - It DOES NOT try to detect verses.
 * - It ONLY formats text already wrapped like: ﴿ ... ﴾
 * - It enforces direction + bidi isolation so brackets never flip or disappear.
 *
 * IMPORTANT: You should define a CSS class `.quran-bracket` globally using a font
 * that supports the glyphs ﴿ ﴾ (e.g., Amiri).
 */
function AyahInline({ text }: { text: string }) {
  // NEW: Determine language direction for THIS ayah snippet only
  const isArabic = hasArabicLetters(text); // NEW
  const dir = isArabic ? "rtl" : "ltr"; // NEW: stable direction per snippet

  return (
    <span
      dir={dir} // NEW: lock direction to prevent mirroring
      style={{ unicodeBidi: "isolate" }} // NEW: isolate from surrounding paragraph bidi
    >
      {/* NEW: render opening bracket separately with bracket-safe font */}
      <span
        className="quran-bracket" // NEW: apply bracket-supporting font only here
        dir={dir} // NEW
        style={{ unicodeBidi: "isolate" }} // NEW
        aria-hidden="true"
      >
        ﴿
      </span>

      {/* NEW: bold the ayah text itself; arabic-text only for Arabic */}
      <strong
        className={isArabic ? "arabic-text font-semibold" : "font-semibold"} // NEW
        dir={dir} // NEW
        style={{ unicodeBidi: "isolate" }} // NEW
      >
        {text}
      </strong>

      {/* NEW: render closing bracket separately with bracket-safe font */}
      <span
        className="quran-bracket" // NEW
        dir={dir} // NEW
        style={{ unicodeBidi: "isolate" }} // NEW
        aria-hidden="true"
      >
        ﴾
      </span>
    </span>
  );
}

/**
 * NEW: Render text that may contain ﴿...﴾ segments.
 * We bold ONLY the explicitly marked segments, and leave everything else untouched.
 * This is the "simple + consistent" method you asked for.
 */
function renderWithAyahBrackets(text: string) {
  // NEW: Split while keeping ﴿...﴾ tokens
  const parts = text.split(/(﴿.*?﴾)/g);

  return parts.map((part, i) => {
    const isAyahToken = part.startsWith("﴿") && part.endsWith("﴾"); // NEW

    if (!isAyahToken) {
      return <span key={i}>{part}</span>; // NEW: plain text
    }

    const inner = part.slice(1, -1); // NEW: strip ﴿ and ﴾
    return <AyahInline key={i} text={inner} />; // NEW: stable ayah formatting
  });
}

export default function JuzPage() {
  const params = useParams();

  // Robust route param support (covers multiple route setups)
  const rawId =
    (params as any).id ??
    (params as any).juz ??
    (params as any).juzNumber ??
    (params as any).num;

  const juzId = useMemo(() => Number(rawId), [rawId]);

  const [data, setData] = useState<JuzData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageMode>("Both");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setError(null);
    setData(null);

    if (!rawId || Number.isNaN(juzId)) {
      setError("Invalid Juz id in URL.");
      return;
    }

    loadJuz(juzId)
      .then((result) => setData(result))
      .catch((e: unknown) => {
        const msg =
          e instanceof Error
            ? e.message
            : typeof e === "string"
              ? e
              : JSON.stringify(e);
        setError(msg);
      });
  }, [rawId, juzId]);

  const headers = {
    question: language === "Arabic" ? "السؤال" : "Question",
    answer: language === "Arabic" ? "الآية" : "Answer",
    explanation: language === "Arabic" ? "الشرح" : "Explanation",
  };

  if (!data && !error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Loading Juz…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
          <Link to="/" className="text-sm text-slate-600 hover:text-slate-900 transition">
            ← Back to Juz list
          </Link>

          <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="font-semibold text-red-700">Failed to load Juz</div>
            <div className="mt-2 text-sm text-slate-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = data!.items.filter((item) => {
    const q = search.trim().toLowerCase();
    const qEn = (item.question_en ?? "").toLowerCase();
    const qAr = item.question_ar ?? "";
    return qEn.includes(q) || qAr.includes(search.trim());
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            ← Back to Juz list
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
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Juz {data!.juz}
          </h1>
          <p className="text-sm text-slate-600">
            Questions &amp; Answers (Arabic verse is always shown).
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within this Juz…"
            className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Items */}
        <div className="space-y-5">
          {filtered.map((item, index) => {
            const isOpen = openIndex === index;

            const hasExplanation =
              Boolean(item.answer.commentary_ar?.trim()) ||
              Boolean(item.answer.commentary_en?.trim());

            // Keep verse text exact, but render brackets separately to avoid bidi problems
            const ayahTextNoBrackets = item.answer.ayah_ar.replace(/[﴿﴾]/g, "").trim();

            return (
              <div
                key={item.qNum}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
                      {item.qNum}
                    </div>

                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-900">
                        Question {item.qNum}
                      </div>
                      <div className="text-xs text-slate-500">
                        {isOpen ? "Tap to collapse" : "Tap to expand"}
                      </div>
                    </div>
                  </div>

                  <div className="text-slate-400 text-xl">{isOpen ? "▾" : "▸"}</div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-2 space-y-8">
                    {/* Question */}
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                        {headers.question}
                      </h3>

                      {(language === "English" || language === "Both") && (
                        <p className="text-sm leading-7 text-slate-800 text-left">
                          {item.question_en}
                        </p>
                      )}

                      {(language === "Arabic" || language === "Both") && (
                        <p className="arabic-text text-right text-slate-900">
                          {item.question_ar}
                        </p>
                      )}
                    </section>

                    {/* Answer */}
                    <section className="space-y-3">
                      <h3 className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                        {headers.answer}
                      </h3>

                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                        {/* Arabic verse ALWAYS */}
                        <p className="arabic-verse text-slate-900 text-right" dir="rtl" lang="ar">
                          {/* NEW: Render brackets with bracket font; keep inside plaintext */}
                          <span className="quran-bracket" aria-hidden="true">
                            ﴿
                          </span>
                          <span style={{ unicodeBidi: "plaintext" }}>{ayahTextNoBrackets}</span>
                          <span className="quran-bracket" aria-hidden="true">
                            ﴾
                          </span>
                        </p>

                        {/* English verse only EN/BOTH */}
                        {(language === "English" || language === "Both") && (
                          <p className="text-sm leading-7 text-slate-700 text-left italic">
                            {item.answer.ayah_en}
                          </p>
                        )}

                        <div className="text-xs text-slate-500">
                          {item.answer.surah} — {item.answer.ayah}
                        </div>
                      </div>
                    </section>

                    {/* Explanation */}
                    {hasExplanation && (
                      <section className="space-y-3">
                        <h3 className="text-xs font-semibold tracking-widest uppercase text-slate-500">
                          {headers.explanation}
                        </h3>

                        {(language === "English" || language === "Both") &&
                          item.answer.commentary_en?.trim() && (
                            <p className="text-sm leading-7 text-slate-800 text-left">
                              {/* NEW: Only format explicitly marked ﴿...﴾ segments */}
                              {renderWithAyahBrackets(item.answer.commentary_en)}
                            </p>
                          )}

                        {(language === "Arabic" || language === "Both") &&
                          item.answer.commentary_ar?.trim() && (
                            <p className="arabic-text text-right text-slate-900">
                              {/* NEW: Only format explicitly marked ﴿...﴾ segments */}
                              {renderWithAyahBrackets(item.answer.commentary_ar)}
                            </p>
                          )}
                      </section>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-500">
              No results found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}