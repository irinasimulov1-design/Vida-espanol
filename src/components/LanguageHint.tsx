"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  detectLocale,
  STORAGE_HINT_DISMISSED,
  STORAGE_LANG,
  type Locale,
} from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { alternateUrl } from "@/components/LanguageSwitcher";
import { track } from "@/lib/track";

type Hints = Record<Locale, Dictionary["languageHint"]>;

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Jezik browsera kome treba ponuditi drugu verziju ove stranice, ili "" ako ne treba. */
function suggestedLocale(lang: Locale): string {
  if (storageGet(STORAGE_HINT_DISMISSED) || storageGet(STORAGE_LANG) === lang) return "";
  const preferred = detectLocale(navigator.languages ?? [navigator.language]);
  return preferred !== lang && alternateUrl(preferred) ? preferred : "";
}

const noopSubscribe = () => () => {};

/**
 * Unutrašnje stranice nikad ne preusmeravaju (Googlebot mora da vidi oba jezika).
 * Umesto toga, ako browser govori drugi jezik a prevod postoji, nudimo ga ovom trakom.
 */
export default function LanguageHint({ lang, hints }: { lang: Locale; hints: Hints }) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const suggested = useSyncExternalStore(
    noopSubscribe,
    () => suggestedLocale(lang),
    () => ""
  ) as Locale | "";

  if (!suggested || dismissed) return null;

  const t = hints[suggested];
  const isPost = pathname.includes("/blog/");

  return (
    <div lang={suggested} className="border-b border-zlatna/60 bg-zlatna/25">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-sm text-braon md:px-8">
        <p>
          {isPost ? t.post : t.page}{" "}
          <a
            href={`/${suggested}`}
            hrefLang={suggested}
            onClick={(e) => {
              e.currentTarget.href = alternateUrl(suggested) ?? `/${suggested}`;
              track("promena_jezika", { sa: lang, na: suggested, nacin: "traka" });
            }}
            className="font-semibold text-terracotta underline-offset-4 hover:underline"
          >
            {t.link}
          </a>
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(STORAGE_HINT_DISMISSED, "1");
            } catch {
              // traka ostaje zatvorena do sledećeg učitavanja
            }
            setDismissed(true);
          }}
          aria-label={t.close}
          className="px-1 text-lg leading-none text-braon/60 hover:text-braon"
        >
          ×
        </button>
      </div>
    </div>
  );
}
