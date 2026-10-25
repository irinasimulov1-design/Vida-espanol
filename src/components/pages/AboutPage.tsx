import type { Metadata } from "next";
import Image from "next/image";
import SocialLinks from "@/components/SocialLinks";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { pageAlternates } from "@/lib/routes";
import { site } from "@/lib/site";

// Deli je /sr/o-meni i /en/about.

export function aboutMetadata(lang: Locale): Metadata {
  const t = getDictionary(lang);
  return {
    title: t.meta.aboutTitle,
    description: t.meta.aboutDescription,
    alternates: pageAlternates("about", lang),
    openGraph: { type: "profile", images: [{ url: site.author.image, alt: site.author.name }] },
  };
}

const pillarIcons = [
  <path key="vo" d="M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5a1 1 0 010-5H20" />,
  <path key="ku" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  <polygon key="m" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
];

export default function AboutPage({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const a = t.about;

  return (
    <main>
      {/* Ko je — intro section */}
      <section className="py-22 md:py-36">
        <div className="mx-auto max-w-300 px-5 md:px-8">
          <h1>{a.title}</h1>

          <div className="mt-10 flex max-w-140 flex-col gap-5">
            {a.paragraphs.map((paragraph, i) => (
              <p key={i}>
                {i === 0 && (
                  <>
                    <strong className="text-negro">{a.introLabel}</strong>
                    <br />
                  </>
                )}
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={site.social.instagram}
              target="_blank"
              rel="me noopener noreferrer"
              className="btn"
            >
              {a.writeMe}
            </a>
            {site.social.preply && (
              <a
                href={site.social.preply}
                target="_blank"
                rel="me noopener noreferrer"
                className="btn btn-ghost"
              >
                {a.preplyCta}
              </a>
            )}
          </div>

          <div className="mt-10">
            <p className="eyebrow">{t.social.title}</p>
            <div className="mt-3">
              <SocialLinks labels={t.social} variant="light" />
            </div>
          </div>
        </div>
      </section>

      {/* Šta je najvažnije — method section */}
      <section className="border-t border-linija py-22 md:py-40">
        <div className="mx-auto max-w-300 px-5 md:px-8">
          <h2 className="text-center">
            {a.methodTitle}
          </h2>

          <div className="mt-16 flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-20">
            {/* Polaroid: papirni ram, blago nakrivljen; ispravi se na hover (ispod 480px bez nagiba) */}
            <div className="w-full max-w-md shrink-0 bg-papel p-4.5 pb-16 shadow-papel transition duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-predmet min-[480px]:-rotate-2 lg:w-120 lg:max-w-none">
              <Image
                src={site.author.image}
                alt={a.imageAlt}
                width={560}
                height={744}
                className="photo aspect-[3/4] w-full object-top"
              />
            </div>

            <div className="flex flex-col gap-10">
              {a.pillars.map((pillar, i) => (
                <div key={pillar.title} className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-linija text-negro">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {pillarIcons[i]}
                    </svg>
                  </div>
                  <div>
                    <h3>{pillar.title}</h3>
                    <p className="mt-2">{pillar.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
