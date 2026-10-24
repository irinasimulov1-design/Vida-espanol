// Studio čita i piše .md postove u istom obliku kao content/posts/sr/_sablon.md,
// da bi src/lib/posts.ts (gray-matter) na buildu dobio potpuno isto što bi dobio od ručnog fajla.
import { parse, stringify } from "yaml";
import type { Locale } from "@/i18n/config";
import type { FaqItem } from "@/lib/posts";

export interface StudioPost {
  lang: Locale;
  slug: string;
  title: string;
  date: string;
  updated: string;
  excerpt: string;
  coverImage: string;
  categories: string[];
  prevod: string;
  ukratko: string;
  faq: FaqItem[];
  draft: boolean;
  body: string;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emptyPost(lang: Locale): StudioPost {
  return {
    lang,
    slug: "",
    title: "",
    date: today(),
    updated: "",
    excerpt: "",
    coverImage: "",
    categories: [],
    prevod: "",
    ukratko: "",
    faq: [],
    draft: true,
    body: "",
  };
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function str(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value == null ? "" : String(value);
}

export function parsePost(lang: Locale, slug: string, text: string): StudioPost {
  const match = FRONTMATTER.exec(text);
  const data = (match ? parse(match[1]) : {}) ?? {};
  return {
    lang,
    slug,
    title: str(data.title),
    date: str(data.date) || today(),
    updated: str(data.updated),
    excerpt: str(data.excerpt),
    coverImage: str(data.coverImage),
    categories: Array.isArray(data.categories) ? data.categories.map(str) : [],
    prevod: str(data.prevod),
    ukratko: str(data.ukratko),
    faq: Array.isArray(data.faq)
      ? data.faq.map((item: Partial<FaqItem>) => ({ pitanje: str(item.pitanje), odgovor: str(item.odgovor) }))
      : [],
    draft: data.draft === true,
    body: (match ? match[2] : text).trim(),
  };
}

/** Prazna opciona polja se izostavljaju; redosled ključeva prati šablon. */
export function serializePost(post: StudioPost): string {
  const data: Record<string, unknown> = {
    title: post.title.trim(),
    date: post.date,
  };
  if (post.draft) data.draft = true;
  if (post.updated && post.updated !== post.date) data.updated = post.updated;
  data.excerpt = post.excerpt.trim();
  if (post.coverImage) data.coverImage = post.coverImage;
  data.categories = post.categories;
  if (post.prevod) data.prevod = post.prevod;
  if (post.ukratko.trim()) data.ukratko = post.ukratko.trim();
  const faq = post.faq.filter((item) => item.pitanje.trim() && item.odgovor.trim());
  if (faq.length) data.faq = faq.map((item) => ({ pitanje: item.pitanje.trim(), odgovor: item.odgovor.trim() }));

  const yaml = stringify(data, {
    defaultStringType: "QUOTE_DOUBLE",
    defaultKeyType: "PLAIN",
    lineWidth: 0,
    flowCollectionPadding: false,
  }).replace(/^categories:\n((?:\s+- .*\n)+)/m, (_, items: string) => {
    // Kategorije u jednom redu, kao u postojećim postovima: ["Gramatika", "Početni nivo"]
    const list = items.trim().split("\n").map((line) => line.trim().slice(2));
    return `categories: [${list.join(", ")}]\n`;
  });

  return `---\n${yaml}---\n\n${post.body.trim()}\n`;
}

export function postPath(lang: Locale, slug: string): string {
  return `content/posts/${lang}/${slug}.md`;
}

/** Da li post vidi posetilac sajta (isto pravilo kao isPublished u src/lib/posts.ts). */
export function postStatus(post: Pick<StudioPost, "draft" | "date">): "objavljen" | "nacrt" | "zakazan" {
  if (post.draft) return "nacrt";
  return post.date > today() ? "zakazan" : "objavljen";
}
