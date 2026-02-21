// lib/loadJuz.ts
import type { JuzData } from "../types";

// zero-pad helper so juz 1 becomes "01"
function pad2(n: number) {
  return String(n).padStart(2, "0"); // ensures juz filenames match juz-01.json, juz-02.json, etc.
}

// NEW: allow numeric juz OR string key (e.g. "bonus")
export async function loadJuz(juz: number | string): Promise<JuzData> {
  // NEW: support special sections by string id
  if (typeof juz === "string") {
    const key = juz.trim().toLowerCase(); // NEW: normalize incoming route param

    // NEW: map "bonus" to a dedicated JSON file in /public/data/bonus.json
    if (key === "bonus") {
      const res = await fetch("/data/bonus.json", { cache: "no-store" }); // NEW: load bonus section
      if (!res.ok) throw new Error(`Failed to fetch /data/bonus.json (${res.status})`); // NEW: clear error
      return (await res.json()) as JuzData;
    }

    // NEW: unknown string key
    throw new Error(`Invalid juz key: ${juz}`);
  }

  // Existing: numeric juz loading
  const juzNumber = juz;

  // basic validation to avoid weird fetches
  if (!Number.isFinite(juzNumber) || juzNumber < 1 || juzNumber > 30) {
    throw new Error(`Invalid juz number: ${juzNumber}`);
  }

  const fileName = `juz-${pad2(juzNumber)}.json`; // matches your file naming convention
  const url = `/data/${fileName}`; // points to your public/data files

  const res = await fetch(url, { cache: "no-store" }); // avoid stale caching during development
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);

  return (await res.json()) as JuzData;
}