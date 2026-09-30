# O projektu

Ovo je fajl o projektu gde ćemo kreirati sajt sa blogom.

## Pregled projekta

Vida-espanol je Next.js 16 sajt sa blogom, izgrađen sa TypeScript-om, Tailwind CSS 4 i App Router-om. Interfejs je na srpskom jeziku.

## Komande

- `npm run dev` — pokretanje dev servera (Turbopack) na http://localhost:3000
- `npm run build` — produkcioni build
- `npm run start` — serviranje produkcionog build-a
- `npm run lint` — pokretanje ESLint-a (flat konfiguracija, `eslint.config.mjs`)

Nije konfigurisan nijedan test framework.

## Arhitektura

- **App Router** sa izvornim kodom u `src/app/`. Rute se mapiraju na `src/app/<ruta>/page.tsx`.
- **Alias za putanje** `@/*` se razrešava u `src/*`.
- **Tailwind CSS 4** putem PostCSS plugina (`@tailwindcss/postcss`); globalni stilovi u `src/app/globals.css`.
- **Fontovi**: DM Sans učitan putem `next/font/google`, dostupan kao CSS promenljiva `--font-dm-sans`.
- **Tip layout-a**: Root layout koristi generisani `LayoutProps<"/">` tip iz Next.js 16.
- **Jezik**: HTML lang atribut je `sr`, sav korisnički tekst je na srpskom.

## Struktura stranica

- `/` — Početna strana (hero sa video pozadinom, poslednja 3 blog posta, newsletter sekcija)
- `/blog` — Lista svih blog postova
- `/blog/[slug]` — Pojedinačni blog post
- `/o-meni` — O meni stranica

## Komponente (`src/components/`)

- `Header.tsx` — Navigacija sajta
- `Footer.tsx` — Footer sajta
- `PostCard.tsx` — Kartica za prikaz blog posta
- `ShareButtons.tsx` — Dugmad za deljenje na društvenim mrežama
- `Newsletter.tsx` — Newsletter sekcija sa video pozadinom i formom za prijavu (client component)

## Blog postovi

Markdown fajlovi u `content/posts/`. Parsiraju se putem `src/lib/posts.ts` koristeći `gray-matter` za frontmatter i `remark`/`rehype` za HTML renderovanje.

## API rute

- `POST /api/newsletter` — Endpoint za newsletter prijavu (koristi Resend SDK za dodavanje kontakta u audience listu)

## Spoljni servisi

- **Resend** — za newsletter. Potrebni env vars: `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`. Konfiguriše se u `.env.local`.

## Next.js 16 — Prvo pročitaj dokumentaciju

Next.js 16 ima breaking promene u odnosu na starije verzije. Pre pisanja koda, konsultuj relevantni vodič u `node_modules/next/dist/docs/` (vidi `AGENTS.md` za detalje). Ne pretpostavljaj da Next.js 14/15 API-ji rade nepromenjeno.

## Napomena o npm nazivu

Folder projekta je `Vida-espanol` (veliko V) ali `package.json` koristi `vida-espanol` (malo slovo) jer npm ne dozvoljava velika slova u imenima paketa.
