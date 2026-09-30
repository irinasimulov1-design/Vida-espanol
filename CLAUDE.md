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
- **Fontovi**: Geist Sans i Geist Mono učitani putem `next/font/google`, dostupni kao CSS promenljive `--font-geist-sans` / `--font-geist-mono`.
- **Tip layout-a**: Root layout koristi generisani `LayoutProps<"/">` tip iz Next.js 16.
- **Jezik**: HTML lang atribut je `sr`, sav korisnički tekst je na srpskom.

## Next.js 16 — Prvo pročitaj dokumentaciju

Next.js 16 ima breaking promene u odnosu na starije verzije. Pre pisanja koda, konsultuj relevantni vodič u `node_modules/next/dist/docs/` (vidi `AGENTS.md` za detalje). Ne pretpostavljaj da Next.js 14/15 API-ji rade nepromenjeno.

## Napomena o npm nazivu

Folder projekta je `Vida-espanol` (veliko V) ali `package.json` koristi `vida-espanol` (malo slovo) jer npm ne dozvoljava velika slova u imenima paketa.
