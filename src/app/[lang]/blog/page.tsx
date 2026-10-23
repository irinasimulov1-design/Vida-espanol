import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import { getDictionary } from "@/i18n";
import { hasLocale, locales, type Locale } from "@/i18n/config";
import { pageAlternates } from "@/lib/routes";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.meta.blogTitle,
    description: t.meta.blogDescription,
    alternates: pageAlternates("blog", lang),
  };
}

export default async function BlogPage(props: PageProps<"/[lang]/blog">) {
  const lang = (await props.params).lang as Locale;
  const t = getDictionary(lang);
  const posts = getAllPosts(lang);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-16 pb-20 md:px-8">
      <p className="font-serif text-lg italic text-terracotta">{t.blog.eyebrow}</p>
      <h1 className="mt-1 text-4xl font-semibold text-braon md:text-5xl">{t.blog.title}</h1>
      <p className="mt-3 max-w-2xl text-braon/70">{t.blog.text}</p>
      {posts.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-braon/60">{t.blog.empty}</p>
      )}
    </main>
  );
}
