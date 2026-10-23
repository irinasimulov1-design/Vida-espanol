import Link from "next/link";
import Logo from "@/components/Logo";
import SocialLinks from "@/components/SocialLinks";
import CookieSettingsLink from "@/components/CookieSettingsLink";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import { bookingHref, href } from "@/lib/routes";
import { site } from "@/lib/site";

export default function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const footerLinks = [
    { label: t.nav.home, href: href("home", lang) },
    { label: t.nav.blog, href: href("blog", lang) },
    { label: t.nav.about, href: href("about", lang) },
    { label: t.nav.book, href: bookingHref(lang) },
  ];

  return (
    <footer className="bg-verde text-blanco/80 inset-shadow-sekcija">
      <div className="mx-auto max-w-300 px-4 py-16 md:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Logo lang={lang} light />
            <div className="mt-6 border-t border-blanco/15 pt-6">
              <p className="font-display text-lg italic text-blanco text-shadow-dubina-sm">El idioma se vive.</p>
              <p className="mt-2 text-sm text-blanco/70">{t.footer.tagline}</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-blanco text-shadow-dubina-sm">{t.footer.links}</h3>
            <ul className="mt-6 flex flex-col gap-3 text-sm">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-oro">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + contact */}
          <div>
            <h3 className="text-blanco text-shadow-dubina-sm">{t.footer.followMe}</h3>
            <div className="mt-6">
              <SocialLinks labels={t.social} />
            </div>

            <h3 className="mt-8 text-blanco text-shadow-dubina-sm">{t.footer.writeMe}</h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <a href={`mailto:${site.email}`} className="transition-colors hover:text-oro">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blanco/15">
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-5 text-xs text-blanco/60 md:px-8">
          <span>&copy; {new Date().getFullYear()} VIDA — a la española</span>
          <Link href={href("privacy", lang)} className="transition-colors hover:text-oro">
            {t.footer.privacy}
          </Link>
          <CookieSettingsLink label={t.footer.cookieSettings} />
        </div>
      </div>
    </footer>
  );
}
