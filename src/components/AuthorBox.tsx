import Image from "next/image";
import Link from "next/link";
import SocialLinks from "@/components/SocialLinks";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { href } from "@/lib/routes";
import { site } from "@/lib/site";

/** Ko stoji iza teksta: za čitaoce, ali i signal stručnosti za Google i AI (E-E-A-T). */
export default function AuthorBox({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <section
      aria-label={t.author.eyebrow}
      className="flex flex-col gap-5 rounded-2xl border border-bez p-6 sm:flex-row sm:items-center"
    >
      <Image
        src={site.author.image}
        alt={site.author.name}
        width={96}
        height={96}
        className="h-24 w-24 shrink-0 rounded-full object-cover object-top"
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
          {t.author.eyebrow}
        </p>
        <p className="mt-1 font-serif text-xl font-semibold text-braon">{site.author.name}</p>
        <p className="mt-2 text-sm leading-relaxed text-braon/75">{t.author.bio}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <SocialLinks labels={t.social} variant="light" />
          <Link
            href={href("about", lang)}
            className="text-sm font-semibold text-terracotta hover:underline"
          >
            {t.author.more}
          </Link>
        </div>
      </div>
    </section>
  );
}
