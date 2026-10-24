import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import PostView from "@/components/PostView";
import { PostJsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/i18n";
import { hasLocale, locales, ogLocale, type Locale } from "@/i18n/config";
import { postAlternates } from "@/lib/routes";

export function generateStaticParams() {
  return locales.flatMap((lang) => getAllSlugs(lang).map((slug) => ({ lang, slug })));
}

async function loadPost(lang: string, slug: string) {
  if (!hasLocale(lang) || !getAllSlugs(lang).includes(slug)) return null;
  return getPostBySlug(lang, slug);
}

export async function generateMetadata(props: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await props.params;
  const post = await loadPost(lang, slug);
  if (!post) return { title: hasLocale(lang) ? getDictionary(lang).meta.postNotFound : undefined };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: postAlternates(post.lang, post.slug, post.prevod || undefined),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      locale: ogLocale[post.lang],
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      tags: post.categories,
      ...(post.coverImage && { images: [{ url: post.coverImage, alt: post.title }] }),
    },
  };
}

export default async function BlogPost(props: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await props.params;
  const post = await loadPost(lang, slug);
  if (!post) notFound();
  const t = getDictionary(lang as Locale);

  return (
    <>
      <PostJsonLd post={post} t={t} />
      <PostView post={post} t={t} contentHtml={post.contentHtml} />
    </>
  );
}
