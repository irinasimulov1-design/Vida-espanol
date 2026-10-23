import Link from "next/link";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { bookingHref, href } from "@/lib/routes";

export default function Header({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const navLinks = [
    { label: t.home, href: href("home", lang), className: "hidden md:block" },
    { label: t.blog, href: href("blog", lang), className: "" },
    { label: t.about, href: href("about", lang), className: "hidden sm:block" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-linija bg-blanco/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-300 items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Logo lang={lang} />
        <ul className="flex items-center gap-3 text-sm font-medium sm:gap-6">
          {navLinks.map((link) => (
            <li key={link.href} className={link.className}>
              <Link
                href={link.href}
                className="text-negro decoration-naranja underline-offset-4 hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <LanguageSwitcher lang={lang} label={t.language} />
          </li>
          <li>
            <Link
              href={bookingHref(lang)}
              className="whitespace-nowrap btn"
            >
              {t.book}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
