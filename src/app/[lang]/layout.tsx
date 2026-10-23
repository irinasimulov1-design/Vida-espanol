import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LanguageHint from "@/components/LanguageHint";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";
import { SiteJsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/i18n";
import { hasLocale, ogLocale, otherLocale } from "@/i18n/config";
import { href } from "@/lib/routes";
import { site } from "@/lib/site";
import { fontClasses } from "../fonts";
import "../globals.css";

// Samo /sr i /en; sve ostalo je 404 (global-not-found.tsx).
export const dynamicParams = false;

export async function generateMetadata(props: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);

  return {
    metadataBase: new URL(site.url),
    title: { default: site.name, template: `%s — ${site.name}` },
    description: t.meta.siteDescription,
    authors: [{ name: site.author.name, url: href("about", lang) }],
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: ogLocale[lang],
      alternateLocale: [ogLocale[otherLocale(lang)]],
      images: [{ url: "/og-vida.png", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image" },
    verification: {
      google: site.verification.google || undefined,
      other: site.verification.bing ? { "msvalidate.01": site.verification.bing } : undefined,
    },
  };
}

export default async function LangLayout(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang} className={`${fontClasses} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteJsonLd lang={lang} t={t} />
        <Header lang={lang} t={t.nav} />
        <LanguageHint
          lang={lang}
          hints={{ sr: getDictionary("sr").languageHint, en: getDictionary("en").languageHint }}
        />
        {props.children}
        <Footer lang={lang} t={t} />
        <CookieConsent t={t.cookies} privacyHref={href("privacy", lang)} />
        <Analytics lang={lang} />
      </body>
    </html>
  );
}
