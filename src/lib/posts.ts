import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import { otherLocale, type Locale } from "@/i18n/config";

// Postovi po jeziku: content/posts/sr/*.md i content/posts/en/*.md.
// Fajlovi koji počinju sa "_" (npr. _sablon.md) se preskaču.
const postsRoot = path.join(process.cwd(), "content", "posts");

export interface FaqItem {
  pitanje: string;
  odgovor: string;
}

export interface Post {
  lang: Locale;
  slug: string;
  title: string;
  date: string;
  updated: string;
  excerpt: string;
  coverImage: string;
  categories: string[];
  /** Slug iste teme na drugom jeziku, ako prevod postoji. */
  prevod: string;
  /** Kratak, direktan odgovor na vrhu posta (GEO: AI najčešće citira baš ovo). */
  ukratko: string;
  faq: FaqItem[];
  /** Nacrt: postoji u repou (i u Studiju), ali se ne objavljuje. */
  draft: boolean;
}

export interface PostWithContent extends Post {
  markdown: string;
  contentHtml: string;
}

function postFiles(lang: Locale): string[] {
  const dir = path.join(postsRoot, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((fileName) => fileName.endsWith(".md") && !fileName.startsWith("_"));
}

function readFrontmatter(lang: Locale, slug: string) {
  return matter(fs.readFileSync(path.join(postsRoot, lang, `${slug}.md`), "utf8"));
}

/** YAML bez navodnika (date: 2026-01-01) gray-matter vraća kao Date; svuda radimo sa "YYYY-MM-DD". */
function isoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value ? String(value) : "";
}

/**
 * Na sajtu su samo objavljeni postovi: bez nacrta i bez onih zakazanih za kasnije (datum u
 * budućnosti). Zakazani se pojave sami kroz jutarnji build (cron u deploy.yml).
 */
function isPublished(data: { draft?: unknown; date?: unknown }): boolean {
  return data.draft !== true && isoDate(data.date) <= new Date().toISOString().slice(0, 10);
}

/** Prevod se povezuje (hreflang, JSON-LD) samo ako je i on objavljen. */
function publishedTranslation(lang: Locale, slug: unknown): string {
  if (typeof slug !== "string" || !slug) return "";
  const other = otherLocale(lang);
  if (!fs.existsSync(path.join(postsRoot, other, `${slug}.md`))) return "";
  return isPublished(readFrontmatter(other, slug).data) ? slug : "";
}

function readPost(lang: Locale, slug: string): { post: Post; markdown: string } {
  const { data, content } = readFrontmatter(lang, slug);

  return {
    post: {
      lang,
      slug,
      title: data.title,
      date: isoDate(data.date),
      updated: isoDate(data.updated),
      excerpt: data.excerpt,
      coverImage: data.coverImage ?? "",
      categories: data.categories ?? [],
      prevod: publishedTranslation(lang, data.prevod),
      ukratko: data.ukratko ?? "",
      faq: data.faq ?? [],
      draft: data.draft === true,
    },
    markdown: content.trim(),
  };
}

function publishedPosts(lang: Locale): Post[] {
  return postFiles(lang)
    .map((fileName) => readPost(lang, fileName.replace(/\.md$/, "")).post)
    .filter(isPublished);
}

export function getAllSlugs(lang: Locale): string[] {
  return publishedPosts(lang).map((post) => post.slug);
}

export function getAllPosts(lang: Locale): Post[] {
  return publishedPosts(lang)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(lang: Locale, slug: string): Promise<PostWithContent> {
  const { post, markdown } = readPost(lang, slug);
  const processedContent = await remark().use(html).process(markdown);

  return { ...post, markdown, contentHtml: processedContent.toString() };
}
