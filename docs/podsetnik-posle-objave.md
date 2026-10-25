# Podsetnik: šta ostaje za posle objave

Sajt namerno još nije objavljen: prvo uređujemo izgled i tekstove, pa tek onda kačimo na internet.
Ovde je sve što je preskočeno jer zahteva da `vidaspanish.com` radi. Kad nešto završiš, štikliraj.

## Već urađeno (ne zahteva objavu)

- [x] GA4 property napravljen, Measurement ID upisan u `site.analytics.ga4`
- [x] Clarity projekat napravljen, Project ID upisan u `site.analytics.clarity`
- [x] Search Console: Domain property `vidaspanish.com` potvrđen preko DNS TXT zapisa u Cloudflare-u (zapis `google-site-verification` ne brisati)
- [x] Bing Webmaster Tools: uvezen iz Search Console-a (sitemap još ne)
- [ ] GA4 key events napravljeni ručno: `forma_zakazivanje_poslata`, `kalendar_otvoren`, `newsletter_potvrda`
- [ ] GA4 data retention: 14 meseci
- [ ] Clarity povezan sa GA4 (Settings → Setup → Google Analytics integration)
- [x] Resend: domen `vidaspanish.com` verifikovan (Ireland, auto configure preko Cloudflare-a)
- [x] Resend: segmenti SR („Vida Newsletter“, stara lista) i EN („VIDA · English“) upisani u `workers/studio-auth/wrangler.toml`
- [x] Resend: API ključ i TEST_TO kao Worker secret, Worker objavljen (`site.studio.authUrl`)
- [x] Studio prijava: GitHub App (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`), Worker objavljen, prijava na `/studio` radi lokalno
- [ ] Opciono: `ANTHROPIC_API_KEY` kao Worker secret (AI predlog prevoda u Studiju)
- [ ] Opciono: Clarity IP blocking (tvoja IP adresa)

## Objava (kad budemo zadovoljni izgledom)

1. Spojiti `dvojezicni-blog-geo` u `master` (deploy kreće sam, `.github/workflows/deploy.yml`).
2. Cloudflare → DNS → Records:
   - četiri `A` zapisa za `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` `www` → `irinasimulov1-design.github.io`
   - sve ove zapise ostaviti na **DNS only** (siva oblačić ikonica), da GitHub može da izda HTTPS sertifikat
3. GitHub → repo → Settings → Pages → Custom domain = `vidaspanish.com` → sačekati proveru → **Enforce HTTPS**.

## Odmah posle objave

- [ ] Otvori `https://vidaspanish.com/`: telefon na srpskom vodi na `/sr`, na engleskom na `/en`
- [ ] Search Console → Sitemaps → `https://vidaspanish.com/sitemap.xml` → Submit
- [ ] Search Console → URL Inspection → `/sr` i `/en` → Request indexing
- [ ] Bing Webmaster Tools → Sitemaps: dodaj `https://vidaspanish.com/sitemap.xml` ručno (ne čekaj da ga preuzme iz GSC-a)
- [ ] Proveri da je GitHub Actions job `indexnow` prošao (javlja URL-ove Bing-u)
- [ ] Rich Results Test (search.google.com/test/rich-results) na jednom postu: BlogPosting + FAQ bez grešaka
- [ ] GA4 → Reports → Realtime: tvoja poseta se vidi
- [ ] Clarity → Recordings: snimak se pojavi posle „Prihvatam“ (može da kasni do 2 sata)
- [ ] Kad Studio i pisma budu radili sa pravog domena: ukloni `http://localhost:3000` iz `ALLOWED_ORIGINS` u `workers/studio-auth/wrangler.toml` i ponovo `npx wrangler deploy` (dok uređuješ lokalno, mora da ostane)
- [ ] Pisma: prijavi se na formu na sajtu, potvrdi link iz mejla, proveri da adresa uđe u pravi segment
- [ ] `public/CNAME` i `site.url` i dalje kažu `vidaspanish.com`

## Prvo pismo

- [ ] U prvom pismu kratko reći da se VIDA preselila na `vidaspanish.com` (stari čitaoci sa SR liste vide novu adresu pošiljaoca)

## Par dana posle objave

- [ ] GA4 → Admin → Events: potvrdi da stižu događaji i da su tri key eventa označena
- [ ] Search Console → Performance: filtriraj po stranici `/sr/` i `/en/` i po zemlji
- [ ] Search Console → Pages: nema grešaka u indeksiranju
