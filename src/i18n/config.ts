export const locales = ["sr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function otherLocale(lang: Locale): Locale {
  return lang === "sr" ? "en" : "sr";
}

export const dateLocale: Record<Locale, string> = { sr: "sr-Latn", en: "en-GB" };
export const ogLocale: Record<Locale, string> = { sr: "sr_RS", en: "en_US" };

export function formatDate(dateString: string, lang: Locale): string {
  return new Date(dateString).toLocaleDateString(dateLocale[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Ključevi u localStorage / sessionStorage.
export const STORAGE_LANG = "vida-jezik"; // ručno izabran jezik
export const STORAGE_HINT_DISMISSED = "vida-jezik-traka"; // zatvorena traka „dostupno i na…“
export const STORAGE_AUTO = "vida-jezik-auto"; // ulazna strana je preusmerila automatski

// Jezici iz regiona koji bez problema čitaju srpsku latinicu.
export const SERBIAN_FAMILY = ["sr", "hr", "bs", "sh", "cnr", "me"];

/**
 * Bira jezik sajta iz liste jezika browsera (navigator.languages), po prioritetu.
 * Prvi jezik koji prepoznamo odlučuje; sve ostalo dobija engleski.
 * Ista logika je prepisana u ulaznu skriptu u src/app/(ulaz)/page.tsx.
 */
export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split("-")[0];
    if (SERBIAN_FAMILY.includes(base)) return "sr";
    if (base === "en") return "en";
  }
  return defaultLocale;
}
