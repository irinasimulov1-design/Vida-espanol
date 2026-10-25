import sr from "./dictionaries/sr";
import en from "./dictionaries/en";
import type { Locale } from "./config";

export type { Dictionary } from "./dictionaries/sr";

const dictionaries = { sr, en };

export function getDictionary(lang: Locale) {
  return dictionaries[lang];
}
