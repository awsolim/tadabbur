// types.ts

export type LanguageMode = "ar" | "en" | "both"; // ✅ Controls what the UI displays

export type AnswerBlock = {
  surah: number; // NEW: Surah number (1–114) used to lookup en.json translation
  ayahs: number[]; // NEW: Always an array (e.g., [115] or [94, 95]) for consistent rendering
  ayah_ar: string; // ✅ Arabic verse text (as shown in the book)
  commentary_ar?: string; // ✅ Optional Arabic commentary
  commentary_en?: string; // ✅ Optional English commentary
};

// NEW: Optional per-question difficulty tags
export type Difficulty = "easy" | "med" | "hard"; // NEW: drives the tag color in the UI

export type QAItem = {
  qNum: number; // ✅ Question number within the Juz
  question_ar: string; // ✅ Arabic question text
  question_en: string; // ✅ English translation of the question
  difficulty?: Difficulty; // NEW: optional tag (easy | med | hard)
  theme?: string; // NEW: optional tag (free text, always styled blue)
  answer: AnswerBlock; // ✅ Nested answer block (matches your new JSON)
};

export type JuzData = {
  juz: number; // ✅ Juz number (1–30)
  items: QAItem[]; // ✅ List of Q&A items
};

// NEW: Shape for quran/en.json (we keep it flexible and minimal)
export type TranslationVerse = {
  chapter: number; // NEW: Surah number
  verse: number; // NEW: Ayah number
  text: string; // NEW: English translation text
};

// NEW: Map of surah number -> verses array, as returned by quran-json
export type TranslationData = Record<string, TranslationVerse[]>;