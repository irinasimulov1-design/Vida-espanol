import Link from "next/link";
import Naranja from "@/components/Naranja";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MobileMenu from "@/components/MobileMenu";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { bookingHref, href } from "@/lib/routes";

/** Navigacija: na pozadini sajta, bez trake; svaki link je crni blok, bordo na hover. */
export default function Header({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const navLinks = [
    { label: t.blog, href: href("blog", lang) },
    { label: t.about, href: href("about", lang) },
  ];

  return (
    <header className="relative z-50 w-full">
      <nav className="mx-auto flex max-w-300 items-center justify-between gap-3 px-5 pt-6 md:px-8">
        {/* Mobilni: „Meni“ levo, narandža u sredini */}
        <div className="flex items-center gap-4 md:hidden">
          <MobileMenu
            lang={lang}
            t={t}
            links={[{ label: t.home, href: href("home", lang) }, ...navLinks]}
          />
        </div>

        <ul className="flex items-center gap-1.5">
          <li>
            <Link href={href("home", lang)} aria-label={`VIDA — ${t.home}`} className="mr-3 block transition-transform duration-300 hover:-rotate-12">
              <Naranja className="h-8 w-8" />
            </Link>
          </li>
          {navLinks.map((link) => (
            <li key={link.href} className="hidden md:block">
              <Link href={link.href} className="nav-blok">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="flex items-center gap-1.5">
          <li className="hidden md:block">
            <LanguageSwitcher lang={lang} label={t.language} />
          </li>
          <li>
            <Link href={bookingHref(lang)} className="nav-blok whitespace-nowrap">
              {t.book}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
