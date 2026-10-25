import Link from "next/link";
import Logo from "@/components/Logo";
import Tenda from "@/components/Tenda";
import SocialLinks from "@/components/SocialLinks";
import CookieSettingsLink from "@/components/CookieSettingsLink";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { bookingHref, href } from "@/lib/routes";
import { site } from "@/lib/site";

const footerLink = "eyebrow text-fondo/60! transition-colors duration-300 hover:text-fondo!";

/** Footer: zelena tenda, ispod crna traka sa logom, rukopisom „llena de vida“ i linkovima. */
export default function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const footerLinks = [
    { label: t.nav.blog, href: href("blog", lang) },
    { label: t.nav.about, href: href("about", lang) },
    { label: t.nav.book, href: bookingHref(lang) },
  ];

  return (
    <footer className="mt-auto bg-negro text-fondo/70">
      <Tenda />

      <div className="mx-auto max-w-300 px-5 pt-16 pb-10 md:px-8 md:pt-20">
        <div className="grid items-center gap-10 text-center md:grid-cols-3 md:text-left">
          <div className="flex justify-center md:justify-start">
            <Logo lang={lang} light />
          </div>

          <p className="font-script text-5xl leading-none text-oro md:text-center">llena de vida</p>

          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 md:justify-end">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className={footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-fondo/15 pt-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <SocialLinks labels={t.social} />
            <a href={`mailto:${site.email}`} className="text-sm text-fondo/60 transition-colors duration-300 hover:text-fondo">
              {site.email}
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-fondo/50">
            <span>&copy; {new Date().getFullYear()} VIDA · a la española</span>
            <Link href={href("privacy", lang)} className="transition-colors duration-300 hover:text-fondo">
              {t.footer.privacy}
            </Link>
            <CookieSettingsLink label={t.footer.cookieSettings} />
          </div>
        </div>
      </div>
    </footer>
  );
}
