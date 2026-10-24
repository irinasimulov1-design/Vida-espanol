# VIDA Studio — podešavanje

Studio (`/studio`) je editor bloga na samom sajtu. Irina piše u prikazu koji izgleda tačno kao objavljen post; „Objavi“ pravi commit u repo, a `deploy.yml` za 1–2 minuta osveži sajt. Markdown fajlovi u `content/posts/` ostaju jedini izvor sadržaja.

```
/studio ──prijava──▶ Cloudflare Worker (workers/studio-auth) ──▶ GitHub App
   │  GitHub API (token samo u sessionStorage, ističe za 8h)
   ▼
commit: content/posts/<jezik>/<slug>.md + public/blog/<slug>/*.jpg ──▶ deploy.yml ──▶ sajt
```

Dok `site.studio.authUrl` u `src/lib/site.ts` nije upisan, Studio prikazuje samo poruku da prijava nije podešena.

## 1. GitHub App (jednom)

GitHub → Settings → Developer settings → GitHub Apps → **New GitHub App**

- **Name**: npr. `VIDA Studio`
- **Homepage URL**: `https://vidaspanish.com`
- **Callback URL**: `https://<worker-adresa>/callback` (adresa iz koraka 2; može se dopisati kasnije)
- **Expire user authorization tokens**: uključeno
- **Webhook**: isključen (Active = ne)
- **Repository permissions**: `Contents: Read and write`, `Actions: Read-only`, `Metadata: Read-only`
- **Where can this app be installed**: Only on this account

Posle kreiranja: zapiši **Client ID**, generiši **Client secret** (ne upisuje se nigde u repo), pa **Install App** → samo repo `Vida-espanol`.

Prijavljuje se Irinin GitHub nalog. Studio proverava da nalog ima pravo pisanja u repo; svi ostali dobijaju poruku da nemaju pristup.

## 2. Cloudflare Worker

```bash
cd workers/studio-auth
npm install
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put ANTHROPIC_API_KEY
```

U `wrangler.toml` upiši `GITHUB_CLIENT_ID` (nije tajna), pa `npx wrangler deploy`. Adresu Workera (npr. `https://vida-studio-auth.<nalog>.workers.dev`) upiši:

- u GitHub App kao Callback URL (`…/callback`)
- u `src/lib/site.ts` → `studio.authUrl` (bez `/` na kraju)

`ANTHROPIC_API_KEY` je potreban samo za dugme „AI predlog“ (prevod SR ↔ EN, model Claude Opus 5.5). Bez njega sve ostalo radi.

Lokalno: `npx wrangler dev` (port 8787), tajne u `workers/studio-auth/.dev.vars` (u `.gitignore`), a `authUrl` privremeno `http://localhost:8787`.

## 3. Grana: proba ili sajt

`site.studio.branch`:

- `"studio-proba"` (sada) — Studio čuva u probnu granu, sajt se ne menja. Grana se pravi sama pri prvom čuvanju.
- `"master"` — „Objavi“ zaista objavljuje; Studio prati GitHub Actions i javi „Objavljeno ✓“.

`site.studio.baseBranch` je grana od koje probna grana nastaje (sada `dvojezicni-blog-geo`, jer `master` još ima stari sajt). Posle spajanja u master postavi i nju na `"master"`.

## Kako radi

- **Statusi**: *nacrt* (`draft: true` — fajl postoji, sajt ga ne prikazuje), *zakazan* (datum u budućnosti — `deploy.yml` svako jutro u 05:00 UTC pravi novi build pa se post pojavi sam), *objavljen*. Pravilo je u `isPublished` u `src/lib/posts.ts`.
- **Prevod**: polje `prevod` se povezuje u oba fajla u istom commitu. Hreflang se pravi samo ako je i prevod objavljen.
- **Slike**: smanjuju se u browseru (max 1920px, JPEG) i idu u `public/blog/<slug>/` u istom commitu kao post.
- **Konflikt**: ako je fajl izmenjen negde drugde od kad je otvoren, Studio ne prepisuje, nego upozori.
- **Nesačuvane izmene** čuvaju se u browseru (localStorage) i nude se za vraćanje pri sledećem otvaranju.
- **Brisanje**: ne postoji; post se sklanja sa sajta prebacivanjem u nacrt.

## Pisma (newsletter preko Resend-a)

U Studiju je tab **Pisma**: Irina piše pismo, gleda ga tačno kako stiže u inbox (računar/telefon), šalje sebi probu, pa šalje svima ili zakazuje. Pored svakog objavljenog teksta u listi stoji „✉ Pismo“, koje napravi pismo sa tim tekstom kao karticom.

```
Sajt: forma (početna, ispod posta) ─▶ Worker /newsletter/subscribe ─▶ mejl „potvrdi prijavu“
      ─▶ /newsletter/confirm ─▶ Resend segment SR ili EN (po jeziku stranice)
Studio: nacrt (content/pisma/<jezik>/*.md) ─▶ proba ─▶ /newsletter/send ─▶ Resend broadcast
```

- **Liste**: Resend „segmenti“ (ranije „audiences“). Postojeća lista sa starog sajta = SR; za EN napravi novi segment.
- **Double opt-in**: adresa ulazi u listu tek kad klikne link iz mejla (važi 48h). Odjava je Resend link u dnu svakog pisma; Worker odbija pismo bez njega.
- **Zaštita od greške**: „Pošalji svima“ se otključava tek kad je proba poslata za tačno tu verziju pisma; pre slanja Studio pita još jednom i pokaže broj ljudi. Zakazano pismo može da se otkaže.
- **Statistika**: primilo / otvorilo / kliknulo / odjavilo se, iz Resend liste primalaca (Resend kešira do 15 min).
- **Slike u pismu**: samo naslovna slika teksta sa bloga (mora već biti na sajtu); upload slika u pismo namerno ne postoji.

### Podešavanje (jednom)

1. Resend → Domains: dodaj `vidaspanish.com` i upiši DNS zapise (SPF, DKIM) kod registra domena; sačekaj „Verified“.
2. Resend → Contacts → Segments: zapiši ID postojeće liste (SR) i napravi novu za EN.
3. Resend → API Keys: ključ sa pravom slanja i rada sa kontaktima/broadcastima.
4. U `workers/studio-auth/wrangler.toml` upiši `RESEND_SEGMENT_SR`, `RESEND_SEGMENT_EN` i po potrebi `NEWSLETTER_FROM`, pa (TEST_TO je adresa na koju stižu probe — kao secret, da tvoja adresa ne bude u javnom repou):

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TEST_TO
npx wrangler deploy
```

Forma za prijavu se na sajtu prikazuje tek kad je `site.studio.authUrl` upisan (lokalno u razvoju se vidi uvek).
