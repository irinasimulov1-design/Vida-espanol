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
    <main className="mx-auto w-full max-w-152 px-6 py-22 md:py-32">
      <h1>{p.title}</h1>
      <p className="mt-6">{p.intro}</p>
      {p.sections.map((section) => (
        <section key={section.title} className="mt-14">
          <h2 className="text-3xl!">{section.title}</h2>
          <ul className="mt-5 flex flex-col gap-3">
            {section.body.map((line) => (
              <li key={line} className="border-l border-negro pl-4">
                {line}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-14 text-sm text-gris">
        <a href={`mailto:${site.email}`} className="link">
          {site.email}
        </a>
      </p>
    </main>
  );
}
