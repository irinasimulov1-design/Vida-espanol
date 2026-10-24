import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import ShareButtons from "@/components/ShareButtons";
import AuthorBox from "@/components/AuthorBox";
import TrackLink from "@/components/TrackLink";
import type { Dictionary } from "@/i18n";
import { formatDate } from "@/i18n/config";
import type { Post } from "@/lib/posts";
import { bookingHref, href } from "@/lib/routes";

export type PostViewData = Pick<
  Post,
  "lang" | "slug" | "title" | "date" | "updated" | "coverImage" | "categories" | "ukratko" | "faq"
>;

/**
 * Mesta koja Studio zamenjuje editabilnim poljima. Kad je slot zadat, prikazuje se umesto
 * statičkog sadržaja (i sekcija se prikazuje i kad je polje prazno, da bi moglo da se popuni).
 */
export interface PostViewSlots {
  title?: ReactNode;
  cover?: ReactNode;
  categories?: ReactNode;
  summary?: ReactNode;
  body?: ReactNode;
  faq?: ReactNode;
}

/** Izgled posta — isti na sajtu (blog/[slug]) i u Studiju (/studio), da bi pregled bio tačan. */
export default function PostView({
  post,
  t,
  contentHtml = "",
  slots = {},
}: {
  post: PostViewData;
  t: Dictionary;
  contentHtml?: string;
  slots?: PostViewSlots;
}) {
  const title = slots.title ?? post.title;
  const categories =
    slots.categories ??
    (post.categories.length > 0 && <p className="eyebrow">{post.categories.join(" · ")}</p>);

  return (
    <main className="pb-22 md:pb-40">
      <header className="mx-auto max-w-200 px-5 pt-16 text-center md:pt-28">
        {!post.coverImage && slots.cover}
        {categories}
        <h1 className="mt-6">{title}</h1>
        <p className="eyebrow mt-6 flex flex-wrap justify-center gap-x-3 text-[11px]!">
          <time dateTime={post.date}>{formatDate(post.date, post.lang)}</time>
          {post.updated && post.updated !== post.date && (
            <span>
              · {t.post.updated}{" "}
              <time dateTime={post.updated}>{formatDate(post.updated, post.lang)}</time>
            </span>
          )}
        </p>
      </header>

      {post.coverImage && (
        <div className="mx-auto mt-14 max-w-300 md:mt-20 md:px-8">
          <div className="relative aspect-[3/2] w-full bg-blanco md:aspect-[16/9]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(min-width: 1200px) 1136px, 100vw"
              className="photo"
              priority
            />
            {slots.cover}
          </div>
        </div>
      )}

      <article className="mx-auto max-w-152 px-6 pt-14 md:pt-20">
        {(post.ukratko || slots.summary) && (
          <aside className="border-l border-negro pl-6">
            <p className="eyebrow">{t.post.summary}</p>
            {slots.summary ?? <p className="mt-3 text-negro">{post.ukratko}</p>}
          </aside>
        )}

        {slots.body ? (
          <div className="prose mt-12">{slots.body}</div>
        ) : (
          <div className="prose mt-12" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}

        {(post.faq.length > 0 || slots.faq) && (
          <section className="mt-20">
            <h2>{t.post.faqTitle}</h2>
            {slots.faq ?? (
              <div className="mt-8 divide-y divide-linija border-y border-linija">
                {post.faq.map((item) => (
                  <details key={item.pitanje} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-negro">
                      {item.pitanje}
                      <span className="text-naranja transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3">{item.odgovor}</p>
                  </details>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-20">
          <AuthorBox lang={post.lang} t={t} />
        </div>
      </article>

      <aside className="mx-auto mt-20 max-w-200 px-5">
        {/* Jedini predmet u boji na kraju posta */}
        <div className="bg-oro px-8 py-14 text-center md:py-18">
          <p className="eyebrow text-negro/70!">{t.post.ctaEyebrow}</p>
          <h2 className="mt-4">{t.post.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-md text-negro/80">{t.post.ctaText}</p>
          <TrackLink
            href={bookingHref(post.lang)}
            event="cta_zakazi_cas"
            params={{ izvor: "post", post: post.slug }}
            className="mt-8 btn"
          >
            {t.post.ctaButton}
          </TrackLink>
        </div>
      </aside>

      <div className="mx-auto mt-20 flex max-w-152 flex-col items-center gap-6 border-t border-linija px-6 pt-10">
        <ShareButtons title={post.title} label={t.post.share} shareOn={t.post.shareOn} />
        <Link href={href("blog", post.lang)} className="text-sm link">
          {t.post.back}
        </Link>
      </div>
    </main>
  );
}
