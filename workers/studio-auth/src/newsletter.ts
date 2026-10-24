// Pisma (newsletter) preko Resend-a. Ključ je samo ovde (Worker secret RESEND_API_KEY).
//   Javno:   POST /newsletter/subscribe → mejl „potvrdi prijavu“ (double opt-in)
//            GET  /newsletter/confirm   → kontakt ulazi u SR ili EN segment
//   Studio:  GET  /newsletter/lists, POST /newsletter/test, POST /newsletter/send,
//            POST /newsletter/cancel, GET /newsletter/history, GET /newsletter/stats
// Segmenti (ranije „audiences“): RESEND_SEGMENT_SR je postojeća lista sa starog sajta.

export interface NewsletterEnv {
  RESEND_API_KEY: string;
  RESEND_SEGMENT_SR: string;
  RESEND_SEGMENT_EN: string;
  NEWSLETTER_FROM: string;
  TEST_TO: string;
  SITE_URL: string;
}

type Lang = "sr" | "en";
const CONFIRM_TTL_MS = 48 * 60 * 60 * 1000;
const RESEND = "https://api.resend.com";

class ResendError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function resend<T>(env: NewsletterEnv, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${RESEND}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "vida-studio-auth",
    },
  });
  const body = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) throw new ResendError(body.message ?? res.statusText, res.status);
  return body;
}

function segment(env: NewsletterEnv, lang: Lang): string {
  return lang === "sr" ? env.RESEND_SEGMENT_SR : env.RESEND_SEGMENT_EN;
}

function isLang(value: unknown): value is Lang {
  return value === "sr" || value === "en";
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

// ——— potpisan link za potvrdu prijave ———

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(text: string): string {
  return new TextDecoder().decode(
    Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0)),
  );
}

async function sign(env: NewsletterEnv, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`newsletter:${env.RESEND_API_KEY}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
}

async function makeToken(env: NewsletterEnv, email: string, lang: Lang): Promise<string> {
  const payload = `${email}|${lang}|${Date.now()}`;
  return `${base64url(new TextEncoder().encode(payload))}.${await sign(env, payload)}`;
}

async function readToken(env: NewsletterEnv, token: string | null): Promise<{ email: string; lang: Lang } | null> {
  if (!token) return null;
  try {
    const [encoded, signature] = token.split(".");
    const payload = fromBase64url(encoded);
    if ((await sign(env, payload)) !== signature) return null;
    const [email, lang, time] = payload.split("|");
    if (!isLang(lang) || Date.now() - Number(time) > CONFIRM_TTL_MS) return null;
    return { email, lang };
  } catch {
    return null;
  }
}

// ——— javno: prijava i potvrda ———

const CONFIRM_TEXT = {
  sr: {
    subject: "Potvrdi prijavu na VIDA pisma",
    hello: "Hola,",
    text: "Hvala što želiš da dobijaš moja pisma o španskom. Još samo jedan klik:",
    button: "Potvrđujem prijavu",
    ignore: "Ako se nisi ti prijavila/prijavio, samo zanemari ovaj mejl — nećeš biti na listi.",
  },
  en: {
    subject: "Confirm your VIDA letters subscription",
    hello: "Hola,",
    text: "Thank you for wanting my letters about Spanish. Just one more click:",
    button: "Yes, sign me up",
    ignore: "If you didn't sign up, simply ignore this email — you won't be added to the list.",
  },
} as const;

function confirmEmail(lang: Lang, link: string): string {
  const t = CONFIRM_TEXT[lang];
  return `<!doctype html><html lang="${lang}"><body style="margin:0;background:#F5F2EC;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#2B2B2B">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:520px;background:#FBF8F2;border:1px solid #E3DED5" cellpadding="0" cellspacing="0"><tr><td style="padding:36px 32px">
<p style="margin:0;font-family:Georgia,serif;font-size:26px;letter-spacing:3px">VIDA</p>
<p style="margin:2px 0 28px;font-family:Georgia,serif;font-style:italic;color:#E07B39">a la española</p>
<p style="margin:0 0 12px;font-size:16px;line-height:1.6">${t.hello}</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6">${t.text}</p>
<a href="${link}" style="display:inline-block;background:#6B1F28;color:#F5F2EC;text-decoration:none;font-size:13px;letter-spacing:3px;text-transform:uppercase;padding:16px 28px">${t.button}</a>
<p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6b6b6b">${t.ignore}</p>
</td></tr></table></td></tr></table></body></html>`;
}

export async function subscribe(request: Request, env: NewsletterEnv, cors: Record<string, string>): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as { email?: string; lang?: string; website?: string };
  const email = (body.email ?? "").trim().toLowerCase();
  // Popunjeno skriveno polje = bot; odgovor je isti kao za uspeh, da bot ne nauči ništa.
  if (body.website) return json({ ok: true }, 200, cors);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !isLang(body.lang)) {
    return json({ error: "invalid" }, 400, cors);
  }

  const link = `${new URL(request.url).origin}/newsletter/confirm?t=${await makeToken(env, email, body.lang)}`;
  try {
    await resend(env, "/emails", {
      method: "POST",
      body: JSON.stringify({
        from: env.NEWSLETTER_FROM,
        to: [email],
        subject: CONFIRM_TEXT[body.lang].subject,
        html: confirmEmail(body.lang, link),
      }),
    });
  } catch (error) {
    console.error("subscribe", error);
    return json({ error: "send" }, 502, cors);
  }
  return json({ ok: true }, 200, cors);
}

export async function confirm(request: Request, env: NewsletterEnv): Promise<Response> {
  const data = await readToken(env, new URL(request.url).searchParams.get("t"));
  const lang = data?.lang ?? "sr";
  if (!data) return Response.redirect(`${env.SITE_URL}/${lang}?pisma=istekao#pisma`, 302);

  const segmentId = segment(env, data.lang);
  try {
    // Kontakti su globalni u Resend-u: novi se pravi odmah u segmentu; postojeći (npr. sa druge
    // liste ili ranije odjavljen pa sad ponovo potvrdio) se doda u segment i ponovo uključi.
    await resend(env, "/contacts", {
      method: "POST",
      body: JSON.stringify({ email: data.email, unsubscribed: false, segments: [{ id: segmentId }] }),
    }).catch(async () => {
      await resend(env, `/contacts/${encodeURIComponent(data.email)}/segments/${segmentId}`, { method: "POST" }).catch(
        () => {},
      );
      await resend(env, `/contacts/${encodeURIComponent(data.email)}`, {
        method: "PATCH",
        body: JSON.stringify({ unsubscribed: false }),
      });
    });
  } catch (error) {
    console.error("confirm", error);
    return Response.redirect(`${env.SITE_URL}/${lang}?pisma=greska#pisma`, 302);
  }
  return Response.redirect(`${env.SITE_URL}/${lang}?pisma=potvrdjeno#pisma`, 302);
}

// ——— Studio (samo za prijavljenu Irinu; provera je u index.ts) ———

interface Page<T> {
  data: T[];
  has_more: boolean;
}

/** Prolazi kroz sve strane (kursor = id poslednjeg), do granice da Worker ne radi predugo. */
async function countAll<T extends { id: string }>(
  env: NewsletterEnv,
  path: string,
  keep: (item: T) => boolean = () => true,
  maxPages = 50,
): Promise<number> {
  let count = 0;
  let after = "";
  for (let page = 0; page < maxPages; page++) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await resend<Page<T>>(env, `${path}${sep}limit=100${after ? `&after=${after}` : ""}`);
    count += res.data.filter(keep).length;
    if (!res.has_more || res.data.length === 0) break;
    after = res.data[res.data.length - 1].id;
  }
  return count;
}

async function lists(env: NewsletterEnv): Promise<Response> {
  const active = (c: { id: string; unsubscribed?: boolean }) => !c.unsubscribed;
  const [sr, en] = await Promise.all(
    (["sr", "en"] as Lang[]).map((lang) =>
      segment(env, lang) ? countAll<{ id: string; unsubscribed?: boolean }>(env, `/segments/${segment(env, lang)}/contacts`, active) : Promise.resolve(0),
    ),
  );
  return json({ sr, en });
}

async function test(request: Request, env: NewsletterEnv): Promise<Response> {
  const { subject, html } = (await request.json().catch(() => ({}))) as { subject?: string; html?: string };
  if (!subject || !html) return json({ error: "Pismo nema naslov ili sadržaj." }, 400);
  await resend(env, "/emails", {
    method: "POST",
    body: JSON.stringify({
      from: env.NEWSLETTER_FROM,
      to: [env.TEST_TO],
      subject: `[PROBA] ${subject}`,
      html: html.split("{{{RESEND_UNSUBSCRIBE_URL}}}").join(env.SITE_URL),
    }),
  });
  return json({ ok: true, to: env.TEST_TO });
}

async function send(request: Request, env: NewsletterEnv): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as {
    lang?: string;
    subject?: string;
    html?: string;
    name?: string;
    scheduledAt?: string;
  };
  if (!isLang(body.lang) || !body.subject || !body.html) return json({ error: "Pismo nije potpuno." }, 400);
  if (!body.html.includes("{{{RESEND_UNSUBSCRIBE_URL}}}")) return json({ error: "Pismo nema link za odjavu." }, 400);
  if (!segment(env, body.lang)) return json({ error: "Lista za ovaj jezik nije podešena." }, 400);

  const created = await resend<{ id: string }>(env, "/broadcasts", {
    method: "POST",
    body: JSON.stringify({
      segment_id: segment(env, body.lang),
      from: env.NEWSLETTER_FROM,
      subject: body.subject,
      html: body.html,
      name: body.name ?? body.subject,
      send: true,
      ...(body.scheduledAt ? { scheduled_at: body.scheduledAt } : {}),
    }),
  });
  return json({ id: created.id });
}

async function cancel(request: Request, env: NewsletterEnv): Promise<Response> {
  const { id } = (await request.json().catch(() => ({}))) as { id?: string };
  if (!id) return json({ error: "Nema pisma." }, 400);
  await resend(env, `/broadcasts/${encodeURIComponent(id)}/cancel`, { method: "POST" });
  return json({ ok: true });
}

interface Broadcast {
  id: string;
  name: string;
  segment_id: string;
  status: "draft" | "scheduled" | "queued" | "sent" | "canceled";
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
}

async function history(env: NewsletterEnv): Promise<Response> {
  const res = await resend<Page<Broadcast>>(env, "/broadcasts");
  const langOf = (id: string): Lang | null =>
    id === env.RESEND_SEGMENT_SR ? "sr" : id === env.RESEND_SEGMENT_EN ? "en" : null;
  return json(
    res.data
      .filter((b) => langOf(b.segment_id))
      .map((b) => ({
        id: b.id,
        name: b.name,
        lang: langOf(b.segment_id),
        status: b.status,
        scheduledAt: b.scheduled_at,
        sentAt: b.sent_at,
        createdAt: b.created_at,
      })),
  );
}

/** Statistika jednog pisma iz liste primalaca po događaju (Resend kešira do 15 min). */
async function stats(request: Request, env: NewsletterEnv): Promise<Response> {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return json({ error: "Nema pisma." }, 400);
  const path = (type: string) => `/broadcasts/${encodeURIComponent(id)}/recipients?type=${type}`;
  const [delivered, opened, clicked, unsubscribed] = await Promise.all(
    ["delivered", "opened", "clicked", "unsubscribed"].map((type) => countAll(env, path(type))),
  );
  return json({ delivered, opened, clicked, unsubscribed });
}

export async function studioRoute(request: Request, env: NewsletterEnv, pathname: string): Promise<Response | null> {
  try {
    if (request.method === "GET" && pathname === "/newsletter/lists") return await lists(env);
    if (request.method === "POST" && pathname === "/newsletter/test") return await test(request, env);
    if (request.method === "POST" && pathname === "/newsletter/send") return await send(request, env);
    if (request.method === "POST" && pathname === "/newsletter/cancel") return await cancel(request, env);
    if (request.method === "GET" && pathname === "/newsletter/history") return await history(env);
    if (request.method === "GET" && pathname === "/newsletter/stats") return await stats(request, env);
  } catch (error) {
    if (error instanceof ResendError) return json({ error: `Resend: ${error.message}` }, 502);
    throw error;
  }
  return null;
}
