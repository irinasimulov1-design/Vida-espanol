# SEO, GEO i analitika — šta treba uraditi ručno

Sve vrednosti se upisuju na **jednom mestu**: `src/lib/site.ts`. Prazno polje = alat se ne učitava.
Posle izmene: commit + push na `master` → GitHub Actions sam builduje i objavljuje sajt.

## 0. Domen `vidaspanish.com`

1. `public/CNAME` već sadrži `vidaspanish.com`, a `site.url` u `src/lib/site.ts` je `https://vidaspanish.com`.
2. Kod registra domena (DNS) usmeri domen na GitHub Pages:
   - četiri `A` zapisa za `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` za `www` → `<github-korisnik>.github.io`
3. GitHub → repo → Settings → Pages → Custom domain = `vidaspanish.com`, uključi **Enforce HTTPS**.

## 1. Google Analytics 4 i Microsoft Clarity

- GA4: Admin → Data streams → Web → **Measurement ID** (`G-…`) → `site.analytics.ga4`
- Clarity: Settings → Overview → **Project ID** → `site.analytics.clarity`
- Clarity → Settings → Setup → poveži sa Google Analytics (vidiš snimke uz GA segmente).
- GA4 → Admin → Events: ovi događaji stižu sami, označi kao **Key events** prva dva:
  - `forma_zakazivanje_poslata`, `kalendar_otvoren` — konverzije (blog → čas)
  - `cta_zakazi_cas`, `klik_profil`, `podeli_post`
  - `promena_jezika` (`nacin`: rucno / traka) i `jezik_automatski` — koliko je automatsko prepoznavanje jezika tačno

Pristanak: GA radi u Consent Mode v2 (bez kolačića dok posetilac ne prihvati). Clarity se učitava tek posle „Prihvatam“.

## 2. Google Search Console

1. search.google.com/search-console → Add property → **URL prefix** → `https://vidaspanish.com/`
2. Metod **HTML tag** → kopiraj samo vrednost iz `content="…"` → `site.verification.google` → push → Verify.
3. Sitemaps → `sitemap.xml` → Submit.
4. Posle par dana: Performance → filter po stranici `/sr/` vs `/en/` i po zemlji.

## 3. Bing Webmaster Tools

1. bing.com/webmasters → **Import from Google Search Console** (jedan klik, bez posebne verifikacije).
   Alternativa: HTML Meta Tag → vrednost iz `content="…"` → `site.verification.bing`.
2. Sitemap se uvozi sa GSC-om.
3. **IndexNow** je već podešen: posle svakog deploya GitHub Actions javlja sve URL-ove iz sitemape (job `indexnow` u `.github/workflows/deploy.yml`, ključ `public/<indexNowKey>.txt`). Bing pokreće i ChatGPT pretragu, pa novi tekst brže stiže i tamo.

## 4. GEO — šta je već na sajtu

| Šta | Gde | Zašto |
|---|---|---|
| `llms.txt`, `llms-full.txt` | `/llms.txt` | AI asistenti čitaju sajt kao čist markdown |
| JSON-LD: Person, WebSite, BlogPosting, FAQPage, Breadcrumb | svaka stranica | AI i Google znaju ko piše i o čemu |
| `ukratko` + `faq` u frontmatteru | post | direktan odgovor koji AI citira |
| Kutija o autorki + `sameAs` profili | dno posta | stručnost i poverenje (E-E-A-T) |
| `robots.txt` dozvoljava GPTBot, ClaudeBot, PerplexityBot… | `/robots.txt` | AI crawleri smeju da čitaju |
| hreflang SR/EN + sitemap sa parovima | `<head>`, `/sitemap.xml` | prava verzija za pravog čitaoca |
| RSS | `/sr/rss.xml`, `/en/rss.xml` | agregatori i brže otkrivanje |

Šablon za nove tekstove: `content/posts/sr/_sablon.md` i `content/posts/en/_sablon.md`.

## 5. Istraživanje tema (Google Autocomplete + Trends)

```bash
npm run istrazi            # oba tržišta, puna pretraga (~10–15 min)
npm run istrazi -- --brzo  # bez abecede, par minuta
npm run istrazi -- --samo=en
```

Rezultat: `istrazivanje/teme-YYYY-MM-DD.md` (+ `.csv` za Excel). Početne fraze i reči za izbacivanje šuma: `scripts/teme-seed.json`.

## 6. Preply i LinkedIn

Upiši URL-ove u `site.social.preply` i `site.social.linkedin`. Ikonice se same pojave u footeru, kutiji o autorki i na O meni, a dodaju se i u `sameAs` schemu.

## 7. Provera posle objave

- Rich Results Test (search.google.com/test/rich-results) na jednom postu → BlogPosting + FAQ bez grešaka
- GA4 → Reports → Realtime: poseta se vidi (posle „Prihvatam“ i bez njega)
- Clarity → Recordings: snimak posle „Prihvatam“
- `https://vidaspanish.com/` sa telefonom na srpskom → `/sr`, na engleskom → `/en`
