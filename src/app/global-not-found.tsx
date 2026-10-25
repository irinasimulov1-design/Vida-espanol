import type { Metadata } from "next";
import Link from "next/link";
import sr from "@/i18n/dictionaries/sr";
import en from "@/i18n/dictionaries/en";
import { fontClasses } from "./fonts";
import "./globals.css";

// Jedan 404 za ceo sajt (sajt ima dva root layout-a, pa nema zajedničkog not-found-a).
// Ne znamo jezik posetioca, zato prikazujemo oba.
export const metadata: Metadata = {
  title: "404 — VIDA a la española",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${fontClasses} h-full antialiased`}>
      <body className="min-h-full">
        <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 text-center">
          <Link href="/" className="leading-none">
            <span className="block font-display text-5xl font-normal tracking-[0.14em] text-negro">VIDA</span>
            <span className="eyebrow mt-3 block">a la española</span>
          </Link>
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
            {[
              { lang: "sr", t: sr.notFound },
              { lang: "en", t: en.notFound },
            ].map(({ lang, t }) => (
              <div key={lang} lang={lang} className="max-w-xs">
                <h1 className="text-3xl!">{t.title}</h1>
                <p className="mt-3">{t.text}</p>
                <Link
                  href={`/${lang}`}
                  className="mt-5 btn"
                >
                  {t.back}
                </Link>
              </div>
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}
