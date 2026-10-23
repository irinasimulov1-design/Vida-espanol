import type { Metadata } from "next";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { pageAlternates } from "@/lib/routes";
import { site } from "@/lib/site";

// Deli je /sr/privatnost i /en/privacy.

export function privacyMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang);
  return {
    title: t.meta.privacyTitle,
    description: t.meta.privacyDescription,
    alternates: pageAlternates("privacy", lang),
  };
}

export default function PrivacyPage({ lang }: { lang: Locale }) {
  const p = getDictionary(lang).privacy;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pt-16 pb-20">
      <h1 className="text-4xl font-semibold text-braon md:text-5xl">{p.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-braon/80">{p.intro}</p>
      {p.sections.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="text-2xl font-semibold text-braon">{section.title}</h2>
          <ul className="mt-4 flex flex-col gap-3 leading-relaxed text-braon/80">
            {section.body.map((line) => (
              <li key={line} className="border-l-2 border-zlatna pl-4">
                {line}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-10 text-sm text-braon/70">
        <a href={`mailto:${site.email}`} className="text-terracotta hover:underline">
          {site.email}
        </a>
      </p>
    </main>
  );
}
