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
    <header className="sticky top-0 z-50 w-full border-b border-bez bg-cloud/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Logo lang={lang} />
        <ul className="flex items-center gap-3 text-sm font-medium sm:gap-6">
          {navLinks.map((link) => (
            <li key={link.href} className={link.className}>
              <Link
                href={link.href}
                className="text-braon transition-colors hover:text-terracotta"
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
              className="whitespace-nowrap rounded-full bg-bordo px-4 py-2 text-cloud transition hover:brightness-110 sm:px-5"
            >
              {t.book}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
