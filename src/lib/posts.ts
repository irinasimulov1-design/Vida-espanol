import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import type { Locale } from "@/i18n/config";

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

function readPost(lang: Locale, slug: string): { post: Post; markdown: string } {
  const fileContents = fs.readFileSync(path.join(postsRoot, lang, `${slug}.md`), "utf8");
  const { data, content } = matter(fileContents);

  return {
    post: {
      lang,
      slug,
      title: data.title,
      date: data.date,
      updated: data.updated ?? "",
      excerpt: data.excerpt,
      coverImage: data.coverImage ?? "",
      categories: data.categories ?? [],
      prevod: data.prevod ?? "",
      ukratko: data.ukratko ?? "",
      faq: data.faq ?? [],
    },
    markdown: content.trim(),
  };
}

export function getAllSlugs(lang: Locale): string[] {
  return postFiles(lang).map((fileName) => fileName.replace(/\.md$/, ""));
}

export function getAllPosts(lang: Locale): Post[] {
  return getAllSlugs(lang)
    .map((slug) => readPost(lang, slug).post)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(lang: Locale, slug: string): Promise<PostWithContent> {
  const { post, markdown } = readPost(lang, slug);
  const processedContent = await remark().use(html).process(markdown);

  return { ...post, markdown, contentHtml: processedContent.toString() };
}
