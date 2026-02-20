// src/types.ts

export type LanguageMode = "ar" | "en" | "both"; // ✅ Controls what the UI displays

export type AnswerBlock = {
  surah: string; // ✅ Surah name (e.g., "Al-Baqarah")
  ayah: string; // ✅ Ayah number or range (e.g., "45–46")
  ayah_ar: string; // ✅ Arabic verse text (as shown in the book)
  ayah_en: string; // ✅ English translation (Sahih International tone)
  commentary_ar?: string; // ✅ Optional Arabic commentary
  commentary_en?: string; // ✅ Optional English commentary
};

export type QAItem = {
  qNum: number; // ✅ Question number within the Juz
  question_ar: string; // ✅ Arabic question text
  question_en: string; // ✅ English translation of the question
  answer: AnswerBlock; // ✅ Nested answer block (matches your JSON)
};

export type JuzData = {
  juz: number; // ✅ Juz number (1–30)
  items: QAItem[]; // ✅ List of Q&A items
};
