// VIDA Studio — mali Cloudflare Worker uz statički sajt (GitHub Pages nema server).
//   GET  /login     → preusmerava na GitHub prijavu (GitHub App)
//   GET  /callback  → menja kod za token i vraća ga prozoru Studija (postMessage)
//   POST /translate → AI predlog verzije posta na drugom jeziku (Claude)
//   /newsletter/*   → pisma preko Resend-a (vidi newsletter.ts)
// Tajne (GITHUB_CLIENT_SECRET, ANTHROPIC_API_KEY) postoje samo ovde, kao Worker secrets.
import Anthropic from "@anthropic-ai/sdk";
import { confirm, studioRoute, subscribe, type NewsletterEnv } from "./newsletter";

interface Env extends NewsletterEnv {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ANTHROPIC_API_KEY: string;
  REPO: string;
  ALLOWED_ORIGINS: string;
}

const STATE_TTL_MS = 10 * 60 * 1000;

function allowedOrigin(env: Env, origin: string | null): string | null {
  if (!origin) return null;
  return env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).includes(origin) ? origin : null;
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function hmac(env: Env, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.GITHUB_CLIENT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
}

/** state = origin|vreme|nonce|potpis — niko ne može da podmetne drugi origin za token. */
async function makeState(env: Env, origin: string): Promise<string> {
  const payload = `${origin}|${Date.now()}|${base64url(crypto.getRandomValues(new Uint8Array(16)))}`;
  return base64url(new TextEncoder().encode(`${payload}|${await hmac(env, payload)}`));
}

async function readState(env: Env, state: string | null): Promise<string | null> {
  if (!state) return null;
  try {
    const decoded = atob(state.replace(/-/g, "+").replace(/_/g, "/"));
    const parts = decoded.split("|");
    if (parts.length !== 4) return null;
    const [origin, time, nonce, signature] = parts;
    if ((await hmac(env, `${origin}|${time}|${nonce}`)) !== signature) return null;
    if (Date.now() - Number(time) > STATE_TTL_MS) return null;
    return allowedOrigin(env, origin);
  } catch {
    return null;
  }
}

/** Stranica u popup-u: preda rezultat prozoru Studija (samo na dozvoljeni origin) i zatvori se. */
function popupResult(origin: string, message: { token?: string; error?: string }): Response {
  const payload = JSON.stringify({ type: "vida-studio-auth", ...message }).replace(/</g, "\\u003c");
  const html = `<!doctype html><meta charset="utf-8"><title>VIDA Studio</title>
<body style="font-family:system-ui;background:#F5F2EC;color:#2B2B2B;display:grid;place-items:center;height:100vh;margin:0">
<p>${message.error ? "Prijava nije uspela." : "Prijavljena si. Ovaj prozor se zatvara…"}</p>
<script>
  if (window.opener) window.opener.postMessage(${payload}, ${JSON.stringify(origin)});
  setTimeout(function () { window.close(); }, 600);
</script></body>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function login(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = allowedOrigin(env, url.searchParams.get("origin"));
  if (!origin) return new Response("Nepoznat sajt.", { status: 400 });

  const github = new URL("https://github.com/login/oauth/authorize");
  github.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  github.searchParams.set("redirect_uri", `${url.origin}/callback`);
  github.searchParams.set("state", await makeState(env, origin));
  return Response.redirect(github.toString(), 302);
}

async function callback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = await readState(env, url.searchParams.get("state"));
  if (!origin) return new Response("Neispravan ili istekao zahtev za prijavu.", { status: 400 });

  const code = url.searchParams.get("code");
  if (!code) return popupResult(origin, { error: "GitHub nije vratio kod za prijavu." });

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!data.access_token) return popupResult(origin, { error: data.error_description ?? "Prijava nije uspela." });
  return popupResult(origin, { token: data.access_token });
}

/** Samo neko ko sme da menja repo sajta sme da troši AI (i ključ nikad ne izlazi iz Workera). */
async function canWrite(env: Env, token: string): Promise<boolean> {
  const res = await fetch(`https://api.github.com/repos/${env.REPO}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "vida-studio-auth",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) return false;
  const repo = (await res.json()) as { permissions?: { push?: boolean } };
  return repo.permissions?.push === true;
}

const TRANSLATE_SYSTEM = `You help Irina, a Spanish teacher, run a bilingual blog (Serbian and English) about learning Spanish.
You receive one blog post as a Markdown file with YAML frontmatter. Write the version of the same topic in the other language (Serbian ↔ English).

This is an adaptation, not a literal translation:
- English posts are written for English speakers learning Spanish; Serbian posts for Serbian speakers. Replace comparisons with the reader's native language (grammar parallels, false friends, pronunciation tips) with ones that make sense for the new reader.
- Keep every Spanish example exactly as written; translate only the explanations.
- Tone: personal, warm, addressing the reader as "you" (Serbian: "ti", Latin script). No fear, no urgency. Do not add claims that cannot be checked.
- Keep the structure: same headings level, lists, bold Spanish examples, images (keep image paths and translate alt text).

Return ONLY the complete Markdown file, starting with "---". Frontmatter keys, in this order: title, excerpt, categories, ukratko, faq (list of pitanje/odgovor). Key names stay as they are (they are Serbian field names); only the values change language. Excerpt at most 155 characters. "ukratko" is a direct 2–3 sentence answer to the title. Do not include date, coverImage, prevod or draft.`;

async function translate(request: Request, env: Env, origin: string): Promise<Response> {
  const cors = { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!token || !(await canWrite(env, token))) return json({ error: "Prijava je istekla. Prijavi se ponovo." }, 401);

  const { markdown } = (await request.json().catch(() => ({}))) as { markdown?: string };
  if (!markdown || markdown.length > 100_000) return json({ error: "Tekst nije poslat." }, 400);

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  try {
    const message = await client.beta.messages
      .stream({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        output_config: { effort: "medium" },
        // Ako bezbednosni filter odbije zahtev, API sam pokuša na rezervnom modelu.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: TRANSLATE_SYSTEM,
        messages: [{ role: "user", content: markdown }],
      })
      .finalMessage();

    if (message.stop_reason === "refusal") return json({ error: "AI nije mogao da napravi predlog za ovaj tekst." }, 502);
    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim()
      .replace(/^```(?:markdown|md)?\n([\s\S]*)\n```$/, "$1");
    if (!text.startsWith("---")) return json({ error: "AI predlog nije u očekivanom obliku. Pokušaj ponovo." }, 502);
    return json({ markdown: text });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: "AI je trenutno zauzet. Pokušaj za minut." }, 429);
    if (error instanceof Anthropic.APIError) return json({ error: "AI trenutno nije dostupan." }, 502);
    throw error;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/login") return login(request, env);
    if (request.method === "GET" && pathname === "/callback") return callback(request, env);

    if (request.method === "GET" && pathname === "/newsletter/confirm") return confirm(request, env);

    // Sve ostalo zovu sajt i Studio iz browsera: samo sa dozvoljenih adresa (CORS).
    if (pathname !== "/translate" && !pathname.startsWith("/newsletter/")) {
      return new Response("Not found", { status: 404 });
    }
    const origin = allowedOrigin(env, request.headers.get("Origin"));
    if (!origin) return new Response("Nepoznat sajt.", { status: 403 });
    const cors = { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          "Access-Control-Allow-Methods": "GET, POST",
          "Access-Control-Allow-Headers": "Authorization, Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    if (request.method === "POST" && pathname === "/newsletter/subscribe") return subscribe(request, env, cors);
    if (request.method === "POST" && pathname === "/translate") return translate(request, env, origin);

    // Slanje i pregled liste samo za nalog koji sme da menja sajt.
    const token = request.headers.get("Authorization")?.replace(/^Bearers+/i, "") ?? "";
    if (!token || !(await canWrite(env, token))) {
      return new Response(JSON.stringify({ error: "Prijava je istekla. Prijavi se ponovo." }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const res = await studioRoute(request, env, pathname);
    if (!res) return new Response("Not found", { status: 404, headers: cors });
    for (const [key, value] of Object.entries(cors)) res.headers.set(key, value);
    return res;
  },
} satisfies ExportedHandler<Env>;
