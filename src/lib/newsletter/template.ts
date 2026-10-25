// Šablon pisma: isti HTML ide u pregled u Studiju, u probno pismo i u slanje svima.
// Email klijenti ne razumeju klase ni moderan CSS, pa je sve u tabelama i inline stilovima;
// boje i fontovi prate VIDA brend (globals.css), sa Georgia/Helvetica kao rezervom.
import type { Locale } from "@/i18n/config";
import { postHref } from "@/lib/routes";
import { absoluteUrl, site } from "@/lib/site";

const C = {
  fondo: "#FBFAF7",
  blanco: "#F5F2EC",
  papel: "#FFFDF8",
  negro: "#1F1F1F",
  texto: "#4A4743",
  gris: "#8A8782",
  linija: "#E6E2DA",
  naranja: "#E07B39",
  tinto: "#6B1F28",
};
const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const SANS = "Outfit, Helvetica, Arial, sans-serif";

export interface FeaturedPost {
  lang: Locale;
  slug: string;
  title: string;
  ukratko: string;
  excerpt: string;
  coverImage: string;
}

export interface LetterContent {
  lang: Locale;
  subject: string;
  preheader: string;
  /** HTML iz editora (p, h2, h3, ul, ol, li, a, strong, em, blockquote, img) */
  bodyHtml: string;
  post?: FeaturedPost | null;
  /** Kampanja za UTM parametre na linkovima ka sajtu */
  campaign: string;
}

const TEXT = {
  sr: {
    read: "Pročitaj tekst",
    signature: "Irina",
    why: "Dobijaš ovo pismo jer si se prijavila/prijavio na VIDA pisma na sajtu",
    unsubscribe: "Odjavi se",
  },
  en: {
    read: "Read the article",
    signature: "Irina",
    why: "You're receiving this letter because you signed up for VIDA letters at",
    unsubscribe: "Unsubscribe",
  },
} as const;

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function withUtm(url: string, campaign: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", "pisma");
  u.searchParams.set("utm_medium", "email");
  u.searchParams.set("utm_campaign", campaign);
  return u.toString();
}

/** Apsolutna adresa slike za pismo (/Spain 1.jpg → …/slika/Spain%201.jpg). */
export function imageUrl(src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  // Slike u pismu služi Worker (iz repoa), da rade i pre nego što je sajt objavljen.
  if (site.studio.authUrl) return `${site.studio.authUrl}/slika${encodeURI(src)}`;
  return absoluteUrl(encodeURI(src));
}

/** Inline stilovi za HTML iz editora, isti izgled kao .prose na sajtu. */
function styleBody(html: string, campaign: string): string {
  const site_ = new URL(site.url).host;
  const p = `margin:0 0 18px;font-family:${SANS};font-size:17px;line-height:1.65;color:${C.texto}`;
  return html
    .replace(/<p>/g, `<p style="${p}">`)
    .replace(/<h2>/g, `<h2 style="margin:32px 0 12px;font-family:${SERIF};font-weight:500;font-size:30px;line-height:1.15;color:${C.negro}">`)
    .replace(/<h3>/g, `<h3 style="margin:26px 0 10px;font-family:${SERIF};font-weight:500;font-style:italic;font-size:23px;line-height:1.2;color:${C.negro}">`)
    .replace(/<ul>/g, `<ul style="margin:0 0 18px;padding-left:22px">`)
    .replace(/<ol>/g, `<ol style="margin:0 0 18px;padding-left:22px">`)
    .replace(/<li>/g, `<li style="margin:0 0 6px;font-family:${SANS};font-size:17px;line-height:1.6;color:${C.texto}">`)
    .replace(/<li><p style="[^"]*">([\s\S]*?)<\/p><\/li>/g, (_, inner) => `<li>${inner}</li>`)
    .replace(/<blockquote>/g, `<blockquote style="margin:24px 0;padding:4px 0 4px 18px;border-left:2px solid ${C.naranja};font-family:${SERIF};font-style:italic;font-size:21px;color:${C.negro}">`)
    .replace(/<strong>/g, `<strong style="font-weight:600">`)
    .replace(/<img ([^>]*?)\/?>/g, (_, attrs: string) => {
      const src = /src="([^"]+)"/.exec(attrs)?.[1] ?? "";
      const alt = /alt="([^"]*)"/.exec(attrs)?.[1] ?? "";
      return `<img src="${imageUrl(src)}" alt="${alt}" width="536" style="display:block;width:100%;max-width:536px;height:auto;margin:8px 0 22px;border:0">`;
    })
    .replace(/<a ([^>]*?)href="([^"]+)"([^>]*)>/g, (_, before: string, href: string, after: string) => {
      const target = href.includes(site_) || href.startsWith("/") ? withUtm(new URL(href, site.url).toString(), campaign) : href;
      const rest = `${before}${after}`.replace(/\s*(target|rel|class)="[^"]*"/g, "");
      return `<a ${rest.trim()} href="${target}" style="color:${C.negro};text-decoration:underline;text-decoration-color:${C.naranja}">`.replace("<a  ", "<a ");
    });
}

function postCard(post: FeaturedPost, campaign: string, lang: Locale): string {
  const url = withUtm(absoluteUrl(postHref(post.lang, post.slug)), campaign);
  const image = post.coverImage
    ? `<a href="${url}"><img src="${imageUrl(post.coverImage)}" alt="${escape(post.title)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0"></a>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 26px;border:1px solid ${C.linija};background:${C.papel}">
<tr><td>${image}</td></tr>
<tr><td style="padding:24px 24px 28px">
<a href="${url}" style="text-decoration:none"><p style="margin:0;font-family:${SERIF};font-weight:500;font-size:27px;line-height:1.15;color:${C.negro}">${escape(post.title)}</p></a>
<p style="margin:12px 0 22px;font-family:${SANS};font-size:16px;line-height:1.6;color:${C.texto}">${escape(post.ukratko || post.excerpt)}</p>
<a href="${url}" style="display:inline-block;background:${C.tinto};color:${C.blanco};text-decoration:none;font-family:${SANS};font-size:12px;letter-spacing:3px;text-transform:uppercase;padding:15px 26px">${TEXT[lang].read}</a>
</td></tr></table>`;
}

/**
 * Celo pismo. `{{{RESEND_UNSUBSCRIBE_URL}}}` Resend zamenjuje ličnim linkom za odjavu
 * (Worker odbija slanje pisma bez njega).
 */
export function renderEmail(letter: LetterContent): string {
  const t = TEXT[letter.lang];
  const host = new URL(site.url).host;
  const home = withUtm(absoluteUrl(`/${letter.lang}`), letter.campaign);
  return `<!doctype html>
<html lang="${letter.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${escape(letter.subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Outfit:wght@300;400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.fondo}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(letter.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fondo}">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td align="center" style="padding:0 0 34px;border-bottom:1px solid ${C.linija}">
<a href="${home}" style="text-decoration:none;color:${C.negro}">
<p style="margin:0;font-family:${SERIF};font-size:40px;font-weight:400;letter-spacing:8px;color:${C.negro}">VIDA</p>
<p style="margin:6px 0 0;font-family:${SANS};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.negro}">a la española</p>
</a>
</td></tr>
<tr><td style="padding:38px 32px 8px;background:${C.fondo}">
${styleBody(letter.bodyHtml, letter.campaign)}
${letter.post ? postCard(letter.post, letter.campaign, letter.lang) : ""}
<!-- Potpis je slika: Gmail i Outlook ne učitavaju web fontove, pa bi rukopis pao na običan serif. -->
<img src="${imageUrl("/potpis-irina.png")}" alt="${t.signature}" width="132" height="68" style="display:block;width:132px;height:auto;margin:22px 0 0;border:0;font-family:${SERIF};font-size:28px;font-style:italic;color:${C.naranja}">
</td></tr>
<tr><td align="center" style="padding:34px 32px 0;border-top:1px solid ${C.linija}">
<p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.7;color:${C.gris}">${t.why} <a href="${home}" style="color:${C.gris}">${host}</a>.</p>
<p style="margin:10px 0 0;font-family:${SANS};font-size:12px;color:${C.gris}"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${C.gris};text-decoration:underline">${t.unsubscribe}</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
