import type { Metadata } from "next";
import { locales, otherLocale, type Locale } from "@/i18n/config";

// Prevedene putanje: /sr/o-meni ↔ /en/about
const segments = {
  home: { sr: "", en: "" },
  blog: { sr: "blog", en: "blog" },
  about: { sr: "o-meni", en: "about" },
  privacy: { sr: "privatnost", en: "privacy" },
} as const;

export type PageKey = keyof typeof segments;

export function href(page: PageKey, lang: Locale): string {
  const segment = segments[page][lang];
  return segment ? `/${lang}/${segment}` : `/${lang}`;
}

export function postHref(lang: Locale, slug: string): string {
  return `/${lang}/blog/${slug}`;
}

export function bookingHref(lang: Locale): string {
  return `${href("home", lang)}#zakazi-cas`;
}

const rss = (lang: Locale) => ({ "application/rss+xml": `/${lang}/rss.xml` });

/** Canonical + hreflang za stranice koje postoje na oba jezika. */
export function pageAlternates(page: PageKey, lang: Locale): Metadata["alternates"] {
  return {
    canonical: href(page, lang),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, href(page, l)])),
      "x-default": page === "home" ? "/" : href(page, "en"),
    },
    types: rss(lang),
  };
}

/** Canonical + hreflang za post; par postoji samo ako post ima prevod. */
export function postAlternates(
  lang: Locale,
  slug: string,
  translationSlug?: string
): Metadata["alternates"] {
  if (!translationSlug) return { canonical: postHref(lang, slug), types: rss(lang) };
  const other = otherLocale(lang);
  const urls = { [lang]: postHref(lang, slug), [other]: postHref(other, translationSlug) };
  return {
    canonical: urls[lang],
    languages: { ...urls, "x-default": urls.en },
    types: rss(lang),
  };
}
