import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Naranja from "@/components/Naranja";
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
    <main className="mx-auto w-full max-w-300 px-5 md:px-8">
      <header className="py-22 text-center md:py-36">
        <p className="eyebrow">{t.blog.eyebrow}</p>
        <h1 className="mt-6">{t.blog.title}</h1>
        <p className="mx-auto mt-6 max-w-140">{t.blog.text}</p>
        <Naranja className="mx-auto mt-10 h-5 w-5" />
      </header>

      <section className="border-t border-negro pt-14 pb-22 md:pb-40">
        {posts.length > 0 ? (
          <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-gris">{t.blog.empty}</p>
        )}
      </section>
    </main>
  );
}
