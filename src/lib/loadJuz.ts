// src/lib/loadJuz.ts

import type { JuzData } from "../types";

// ✅ Loads Juz JSON from /public/data/juz-XX.json
export async function loadJuz(juz: number): Promise<JuzData> {
  const padded = String(juz).padStart(2, "0"); // ✅ Ensures 1 -> "01"
  const res = await fetch(`/data/juz-${padded}.json`); // ✅ Public folder fetch

  if (!res.ok) {
    // ✅ Helpful error when a juz file doesn't exist yet
    throw new Error(`Missing data file: /data/juz-${padded}.json`);
  }

  const data = (await res.json()) as JuzData; // ✅ Parse and type the JSON
  return data;
}
