"use client";

import { locales, STORAGE_LANG, type Locale } from "@/i18n/config";
import { track } from "@/lib/track";

/**
 * Putanja iste stranice na drugom jeziku, iz hreflang linkova u <head> (izvor: generateMetadata).
 * Hreflang je apsolutan (produkcioni domen), pa se uzima samo putanja: radi i lokalno.
 */
export function alternateUrl(target: Locale): string | null {
  const link = document.querySelector<HTMLLinkElement>(
    `link[rel="alternate"][hreflang="${target}"]`
  );
  return link ? new URL(link.href).pathname : null;
}

export default function LanguageSwitcher({ lang, label }: { lang: Locale; label: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-1.5 text-[11px] font-normal uppercase leading-none tracking-[0.3em]"
    >
      {locales.map((locale) =>
        locale === lang ? (
          <span
            key={locale}
            aria-current="true"
            className="bg-negro px-3.5 py-3 text-fondo"
          >
            {locale}
          </span>
        ) : (
          <a
            key={locale}
            href={`/${locale}`}
            hrefLang={locale}
            lang={locale}
            // Pravi cilj (ista stranica na drugom jeziku) se računa u trenutku klika.
            onClick={(e) => {
              e.currentTarget.href = alternateUrl(locale) ?? `/${locale}`;
              try {
                localStorage.setItem(STORAGE_LANG, locale);
              } catch {
                // bez localStorage izbor važi samo za ovu posetu
              }
              track("promena_jezika", { sa: lang, na: locale, nacin: "rucno" });
            }}
            className="px-3.5 py-3 text-negro shadow-[inset_0_0_0_1px_var(--color-negro)] transition-colors duration-300 hover:bg-tinto hover:text-fondo hover:shadow-[inset_0_0_0_1px_var(--color-tinto)]"
          >
            {locale}
          </a>
        )
      )}
    </div>
  );
}
