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
    <main>
      {/* Zaglavlje: verde sa narandžastim „suncem“ kao na vintage posterima */}
      <section className="relative overflow-hidden bg-verde">
        <div
          aria-hidden="true"
          className="absolute top-1/2 -right-24 hidden h-112 w-112 -translate-y-1/4 rounded-full bg-naranja shadow-sunce inset-shadow-sunce md:block lg:right-0"
        />
        {/* Senčenje gornje i donje ivice sekcije, preko sunca */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 inset-shadow-sekcija" />
        <div className="relative mx-auto max-w-300 px-4 py-18 md:px-8 md:py-24">
          <p className="eyebrow text-oro text-shadow-dubina-sm">{t.blog.eyebrow}</p>
          <h1 className="mt-3 text-blanco text-shadow-dubina">{t.blog.title}</h1>
          <p className="mt-4 max-w-140 text-blanco/80 text-shadow-dubina-sm">{t.blog.text}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-300 px-4 py-18 md:px-8 md:py-24">
        {posts.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-negro/60">{t.blog.empty}</p>
        )}
      </section>
    </main>
  );
}
