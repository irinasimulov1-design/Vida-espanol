import type { Metadata } from "next";
import { STORAGE_AUTO, STORAGE_LANG, SERBIAN_FAMILY } from "@/i18n/config";
import { site } from "@/lib/site";
import { fontClasses } from "../fonts";
import "../globals.css";

// Ulazna strana "/": bira jezik po podešavanjima browsera (navigator.languages), ne po IP adresi.
// Ista logika kao detectLocale() u src/i18n/config.ts, prepisana kao mala inline skripta
// da bi se preusmerenje desilo pre iscrtavanja stranice.
const detectScript = `(function () {
  var target = null;
  try { var saved = localStorage.getItem('${STORAGE_LANG}'); if (saved === 'sr' || saved === 'en') target = saved; } catch (e) {}
  if (!target) {
    var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'en'];
    var serbian = ${JSON.stringify(SERBIAN_FAMILY)};
    target = 'en';
    for (var i = 0; i < langs.length; i++) {
      var base = String(langs[i]).toLowerCase().split('-')[0];
      if (serbian.indexOf(base) > -1) { target = 'sr'; break; }
      if (base === 'en') { target = 'en'; break; }
    }
    try { sessionStorage.setItem('${STORAGE_AUTO}', '1'); } catch (e) {}
  }
  location.replace('/' + target + location.search + location.hash);
})();`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: "Spanish, the way it's really spoken. · Španski onako kako se stvarno govori.",
  alternates: {
    canonical: "/",
    languages: { sr: "/sr", en: "/en", "x-default": "/" },
  },
};

export default function EntryLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontClasses} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: detectScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
