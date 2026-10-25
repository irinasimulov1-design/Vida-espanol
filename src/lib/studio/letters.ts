// Pisma u Studiju: nacrti žive u repou (content/pisma/<jezik>/*.md, ne objavljuju se na sajtu),
// a slanje, lista i statistika idu kroz Worker (Resend ključ je samo tamo).
import { parse, stringify } from "yaml";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { today } from "./markdown";
import { slugify } from "./slug";

export type LetterStatus = "nacrt" | "zakazano" | "poslato";

export interface Letter {
  lang: Locale;
  /** ime fajla bez .md; prazno dok nacrt nije prvi put sačuvan */
  id: string;
  subject: string;
  preheader: string;
  /** slug posta sa bloga koji je u pismu kao kartica */
  post: string;
  status: LetterStatus;
  broadcastId: string;
  scheduledAt: string;
  sentAt: string;
  body: string;
}

export function emptyLetter(lang: Locale): Letter {
  return { lang, id: "", subject: "", preheader: "", post: "", status: "nacrt", broadcastId: "", scheduledAt: "", sentAt: "", body: "" };
}

export function letterPath(letter: Pick<Letter, "lang" | "id">): string {
  return `content/pisma/${letter.lang}/${letter.id}.md`;
}

export function newLetterId(subject: string): string {
  return `${today()}-${slugify(subject) || "pismo"}`;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export function parseLetter(lang: Locale, id: string, text: string): Letter {
  const match = FRONTMATTER.exec(text);
  const data = (match ? parse(match[1]) : {}) ?? {};
  const str = (v: unknown) => (v == null ? "" : String(v));
  return {
    lang,
    id,
    subject: str(data.subject),
    preheader: str(data.preheader),
    post: str(data.post),
    status: data.status === "poslato" || data.status === "zakazano" ? data.status : "nacrt",
    broadcastId: str(data.broadcastId),
    scheduledAt: str(data.scheduledAt),
    sentAt: str(data.sentAt),
    body: (match ? match[2] : text).trim(),
  };
}

export function serializeLetter(letter: Letter): string {
  const data: Record<string, unknown> = { subject: letter.subject.trim(), preheader: letter.preheader.trim() };
  if (letter.post) data.post = letter.post;
  data.status = letter.status;
  if (letter.broadcastId) data.broadcastId = letter.broadcastId;
  if (letter.scheduledAt) data.scheduledAt = letter.scheduledAt;
  if (letter.sentAt) data.sentAt = letter.sentAt;
  const yaml = stringify(data, { defaultStringType: "QUOTE_DOUBLE", defaultKeyType: "PLAIN", lineWidth: 0 });
  return `---\n${yaml}---\n\n${letter.body.trim()}\n`;
}

// ——— Worker ———

async function worker<T>(token: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${site.studio.authUrl}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || "Servis za pisma trenutno nije dostupan.");
  return data;
}

export const newsletterReady = !!site.studio.authUrl;

export function listSizes(token: string) {
  return worker<Record<Locale, number>>(token, "/newsletter/lists");
}

export function sendTest(token: string, subject: string, html: string) {
  return worker<{ ok: true; to: string; id: string }>(token, "/newsletter/test", { subject, html });
}

/** Resend `last_event`: sent, delivered, bounced, complained, suppressed, failed, delivery_delayed… */
export function emailStatus(token: string, id: string) {
  return worker<{ lastEvent: string; to: string }>(token, `/newsletter/email?id=${encodeURIComponent(id)}`);
}

export function sendLetter(
  token: string,
  letter: { lang: Locale; subject: string; html: string; name: string; scheduledAt?: string },
) {
  return worker<{ id: string }>(token, "/newsletter/send", letter);
}

export function cancelLetter(token: string, id: string) {
  return worker<{ ok: true }>(token, "/newsletter/cancel", { id });
}

export interface SentLetter {
  id: string;
  name: string;
  lang: Locale;
  status: "draft" | "scheduled" | "queued" | "sent" | "canceled";
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export function history(token: string) {
  return worker<SentLetter[]>(token, "/newsletter/history");
}

export interface LetterStats {
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
}

export function stats(token: string, id: string) {
  return worker<LetterStats>(token, `/newsletter/stats?id=${encodeURIComponent(id)}`);
}

/** Otisak sadržaja: „Pošalji svima“ važi samo za verziju koja je stigla kao proba. */
export async function contentHash(...parts: string[]): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(parts.join("\u0000")));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
