import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import ShareButtons from "@/components/ShareButtons";
import AuthorBox from "@/components/AuthorBox";
import TrackLink from "@/components/TrackLink";
import { PostJsonLd } from "@/components/JsonLd";
import { getDictionary } from "@/i18n";
import { formatDate, hasLocale, locales, ogLocale, type Locale } from "@/i18n/config";
import { bookingHref, href, postAlternates } from "@/lib/routes";

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
    <main className="pb-20">
      <PostJsonLd post={post} t={t} />
      {post.coverImage && (
        <section className="relative h-[66vh] w-full bg-verde">
          <Image src={post.coverImage} alt={post.title} fill className="photo" priority />
          <div className="absolute inset-0 bg-negro/55" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 inset-shadow-sekcija" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <h1 className="max-w-3xl text-center text-blanco text-shadow-dubina">
              {post.title}
            </h1>
            {post.categories.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {post.categories.map((cat) => (
                  <span
                    key={cat}
                    className="eyebrow bg-oro px-3 py-1 text-negro"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <article className="mx-auto max-w-152 px-6 pt-10">
        {!post.coverImage && (
          <h1 className="text-negro">{post.title}</h1>
        )}
        <p className="mt-3 flex flex-wrap gap-x-3 text-sm text-negro/60">
          <time dateTime={post.date}>{formatDate(post.date, post.lang)}</time>
          {post.updated && post.updated !== post.date && (
            <span>
              · {t.post.updated}{" "}
              <time dateTime={post.updated}>{formatDate(post.updated, post.lang)}</time>
            </span>
          )}
        </p>

        {post.ukratko && (
          <aside className="mt-8 bg-oro/35 px-6 py-5">
            <p className="eyebrow">
              {t.post.summary}
            </p>
            <p className="mt-2 leading-relaxed text-negro">{post.ukratko}</p>
          </aside>
        )}

        <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

        {post.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="text-negro">{t.post.faqTitle}</h2>
            <div className="mt-6 divide-y divide-linija border-y border-linija">
              {post.faq.map((item) => (
                <details key={item.pitanje} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-negro">
                    {item.pitanje}
                    <span className="text-naranja transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-negro/80">{item.odgovor}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <AuthorBox lang={post.lang} t={t} />
        </div>
      </article>

      <aside className="mx-auto mt-12 max-w-152 px-6">
        <div className="bg-verde px-8 py-12 text-center inset-shadow-sekcija">
          <p className="eyebrow text-oro text-shadow-dubina-sm">{t.post.ctaEyebrow}</p>
          <h2 className="mt-3 text-blanco text-shadow-dubina">{t.post.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-blanco/80">{t.post.ctaText}</p>
          <TrackLink
            href={bookingHref(post.lang)}
            event="cta_zakazi_cas"
            params={{ izvor: "post", post: post.slug }}
            className="mt-6 btn"
          >
            {t.post.ctaButton}
          </TrackLink>
        </div>
      </aside>

      <div className="mx-auto mt-16 flex max-w-152 flex-col items-center gap-6 border-t border-linija px-6 pt-8">
        <ShareButtons title={post.title} label={t.post.share} shareOn={t.post.shareOn} />
        <Link href={href("blog", post.lang)} className="text-sm link">
          {t.post.back}
        </Link>
      </div>
    </main>
  );
}
