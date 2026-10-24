# O projektu

Ovo je fajl o projektu gde ćemo kreirati sajt sa blogom.

## Pregled projekta

Vida-espanol je Next.js 16 sajt sa blogom, izgrađen sa TypeScript-om, Tailwind CSS 4 i App Router-om. Sajt je dvojezičan (srpski i engleski), sa automatskim prepoznavanjem jezika browsera.

## Komande

- `npm run dev` — pokretanje dev servera (Turbopack) na http://localhost:3000
- `npm run build` — produkcioni build
- `npm run start` — serviranje produkcionog build-a
- `npm run lint` — pokretanje ESLint-a (flat konfiguracija, `eslint.config.mjs`)
- `npm run istrazi` — istraživanje tema za blog (vidi `docs/seo-podesavanje.md`)

Nije konfigurisan nijedan test framework.

## Arhitektura

- **App Router** sa izvornim kodom u `src/app/`. Rute se mapiraju na `src/app/<ruta>/page.tsx`.
- **Alias za putanje** `@/*` se razrešava u `src/*`.
- **Tailwind CSS 4** putem PostCSS plugina (`@tailwindcss/postcss`); globalni stilovi u `src/app/globals.css`.
- **Fontovi** (`src/app/fonts.ts`, `next/font/google`): Outfit 300/400/500 (tekst, UI; `font-sans`), Cormorant Garamond 500 + italik (naslovi i logo; `font-display`), Mrs Saint Delafield (rukopis, 1–2 reči; `font-script`) i Abril Fatface (samo posteri/razglednice; `font-poster`). Poslednja dva bez preload-a.
- **Brending (VIDA · a la española)**: izvor za tehnički deo je `vida-brending.md` (fontovi, boje, raspored, komponente; NE ponuda, ton ni naslovi). Boje su Tailwind tokeni u `globals.css`: neutralne `blanco` (pozadina), `hormigon` (tihe sekcije), `negro` (sav tekst), pomoćne `papel` i `linija`; boje `naranja`, `rojo`, `tinto`, `verde`, `mostaza`, `oro`. 70% neutralno / 30% boja, jedna boja po sekciji; `tinto` SAMO za CTA dugmad; naranja/rojo/tinto nikad jedna do druge. Bez zaobljenja, tanke linije umesto senki (`shadow-papel` samo za „papirne“ predmete). Gotove klase: `btn`, `btn-ghost`, `btn-ghost-light`, `eyebrow`, `link`, `photo`. Sadržaj max 1200px (`max-w-300`), tekst max 560px, razmak sekcija `py-18 md:py-30`. Ton: lično, toplo, „ti“, bez straha i žurbe, tvrdnje moraju moći da se provere.
- **Konfiguracija**: `src/lib/site.ts` je jedino mesto za domen (`vidaspanish.com`), GA4/Clarity ID-jeve, GSC/Bing verifikaciju, IndexNow ključ, Preply/LinkedIn/Instagram linkove i booking podešavanja. Prazno polje = ne prikazuje se / ne učitava.
- **Tri root layout-a**: `src/app/[lang]/layout.tsx` (sajt, `<html lang={lang}>`), `src/app/(ulaz)/layout.tsx` (samo `/`) i `src/app/(studio)/layout.tsx` (samo `/studio`). 404 ide kroz `src/app/global-not-found.tsx` (`experimental.globalNotFound`).
- **Tipovi**: generisani `LayoutProps` / `PageProps` / `RouteContext` iz Next.js 16 (`npx next typegen` posle dodavanja ruta).

## Dvojezičnost (sr / en)

- Sve stranice su pod `/sr/...` i `/en/...`. Putanje se prevode (`/sr/o-meni` ↔ `/en/about`, `/sr/privatnost` ↔ `/en/privacy`) — mapa je u `src/lib/routes.ts` (`href`, `postHref`, `pageAlternates`, `postAlternates`). Stranica sa prevedenom putanjom postoji kao dva foldera pod `[lang]/` koji dele komponentu iz `src/components/pages/` i svaki u `generateStaticParams` vraća samo svoj jezik.
- Tekstovi interfejsa: `src/i18n/dictionaries/sr.ts` i `en.ts` (`en` mora da prati oblik `sr`), `getDictionary(lang)` iz `src/i18n`. Podešavanja jezika i `detectLocale`: `src/i18n/config.ts`.
- **Prepoznavanje jezika** po `navigator.languages` (ne po IP-u): sr/hr/bs/sh/cnr/me → srpski, sve ostalo → engleski; ručni izbor (SR|EN u headeru, `localStorage`) uvek pobeđuje. Automatski redirect radi **samo** na `/` (inline skripta u `(ulaz)/layout.tsx`, ista logika kao `detectLocale`). Unutrašnje stranice nikad ne preusmeravaju (Googlebot mora da vidi oba jezika) — umesto toga `LanguageHint` nudi prevod trakom.
- Prekidač i traka nalaze URL prevoda čitajući hreflang `<link rel="alternate">` iz `<head>`, pa svaka stranica mora imati `alternates` u metadata.
- HTML lang je `sr` ili `en` po ruti. Srpski tekst: latinica, obraćanje na „ti“.

## Struktura stranica

- `/` — ulaz: prepoznaje jezik i preusmerava na `/sr` ili `/en` (x-default za hreflang)
- `/[lang]` — Početna (hero sa video pozadinom, poslednja 3 posta, forma za zakazivanje `#zakazi-cas`)
- `/[lang]/blog`, `/[lang]/blog/[slug]` — lista i post (Ukratko, FAQ, kutija o autorki, CTA, deljenje)
- `/sr/o-meni`, `/en/about` — O meni
- `/sr/privatnost`, `/en/privacy` — Politika privatnosti
- `/studio` — VIDA Studio, editor bloga za Irinu (client-only, noindex, `Disallow` u robots)
- Generisano pri buildu (`force-static`): `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/[lang]/rss.xml`

## Komponente (`src/components/`)

- `Logo.tsx`, `Header.tsx` (sa `LanguageSwitcher`), `Footer.tsx`, `LanguageHint.tsx`
- `PostView.tsx` — izgled posta, deljen između `blog/[slug]` i Studija (slotovi za editabilna polja)
- `studio/` — Studio: `Studio` (prijava, lista), `Editor` (WYSIWYG preko `PostView`), `RichBody` (Tiptap + markdown), `Fields`, `SeoPanel`; logika u `src/lib/studio/` (`github.ts` commit kroz Git Data API, `markdown.ts` frontmatter, `auth.ts`, `image.ts`, `slug.ts`)
- `PostCard.tsx`, `ShareButtons.tsx`, `AuthorBox.tsx`, `SocialLinks.tsx` (Instagram/LinkedIn/Preply; profil bez URL-a se ne prikazuje)
- `Booking.tsx` — forma za zakazivanje časa (client): podaci u Google Sheet (Apps Script), termin u Cal.com modalu. Preuzeto iz „prodajna stranica“.
- `Analytics.tsx` (GA4 u Consent Mode v2, Clarity tek posle pristanka), `CookieConsent.tsx` (baner; stanje u `src/lib/consent.ts`), `CookieSettingsLink.tsx`
- `JsonLd.tsx` — schema.org: WebSite + Person (sajt), BlogPosting + Breadcrumb + FAQPage (post)
- `TrackLink.tsx` — `Link` koji šalje GA događaj; događaji su tipizirani u `src/lib/track.ts`

## Blog postovi

- `content/posts/sr/*.md` i `content/posts/en/*.md`, parsira `src/lib/posts.ts` (`gray-matter` + `remark`). Fajlovi sa `_` se preskaču (šabloni `_sablon.md`).
- Frontmatter: `title`, `date`, `draft?` (nacrt, ne objavljuje se), `updated?`, `excerpt`, `coverImage`, `categories`, `prevod?` (slug iste teme na drugom jeziku — pravi hreflang par), `ukratko?` (direktan odgovor na vrhu, za GEO), `faq?` (lista `pitanje`/`odgovor` → sekcija + FAQPage schema).
- Engleske verzije nisu doslovni prevodi: pisane su za strance koji uče španski.
- Na sajtu su samo objavljeni postovi (`isPublished` u `posts.ts`): bez `draft: true` i bez datuma u budućnosti (zakazani; `deploy.yml` ima jutarnji cron). `prevod` se povezuje samo ako je i par objavljen.
- Postove piše i menja **VIDA Studio** (`/studio`): commit u granu `site.studio.branch` preko GitHub App prijave; Cloudflare Worker `workers/studio-auth/` (OAuth + AI predlog prevoda). Podešavanje: `docs/studio.md`.

## Hosting, SEO i spoljni servisi

- Statički export (`output: "export"`) na GitHub Pages (`.github/workflows/deploy.yml`), domen u `public/CNAME`. Nema servera ni API ruta; route handleri moraju imati `dynamic = "force-static"`.
- Posle deploya job `indexnow` javlja URL-ove iz sitemape (ključ: `site.indexNowKey` + `public/<ključ>.txt`).
- Ručna podešavanja (DNS, GA4, Clarity, Search Console, Bing): `docs/seo-podesavanje.md`.
- **Google Apps Script** — prima podatke iz forme; **Cal.com** (`@calcom/embed-react`) — kalendar.
- `npm run istrazi` — istraživanje tema (Google Autocomplete za sr i en tržište + Google Trends linkovi) → `istrazivanje/`. Fraze: `scripts/teme-seed.json`.

## Next.js 16 — Prvo pročitaj dokumentaciju

Next.js 16 ima breaking promene u odnosu na starije verzije. Pre pisanja koda, konsultuj relevantni vodič u `node_modules/next/dist/docs/` (vidi `AGENTS.md` za detalje). Ne pretpostavljaj da Next.js 14/15 API-ji rade nepromenjeno.

## Napomena o npm nazivu

Folder projekta je `Vida-espanol` (veliko V) ali `package.json` koristi `vida-espanol` (malo slovo) jer npm ne dozvoljava velika slova u imenima paketa.
