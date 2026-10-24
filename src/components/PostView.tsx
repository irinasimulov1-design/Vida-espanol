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
    (post.categories.length > 0 && (
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {post.categories.map((cat) => (
          <span key={cat} className="eyebrow bg-oro px-3 py-1 text-negro">
            {cat}
          </span>
        ))}
      </div>
    ));

  return (
    <main className="pb-20">
      {post.coverImage && (
        <section className="relative h-[66vh] w-full bg-verde">
          <Image src={post.coverImage} alt={post.title} fill className="photo" priority />
          <div className="absolute inset-0 bg-negro/55" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 inset-shadow-sekcija" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <h1 className="w-full max-w-3xl text-center text-blanco text-shadow-dubina">{title}</h1>
            {categories}
          </div>
          {slots.cover}
        </section>
      )}
      <article className="mx-auto max-w-152 px-6 pt-10">
        {!post.coverImage && (
          <>
            {slots.cover}
            <h1 className="text-negro">{title}</h1>
            {slots.categories}
          </>
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

        {(post.ukratko || slots.summary) && (
          <aside className="mt-8 bg-oro/35 px-6 py-5">
            <p className="eyebrow">{t.post.summary}</p>
            {slots.summary ?? <p className="mt-2 leading-relaxed text-negro">{post.ukratko}</p>}
          </aside>
        )}

        {slots.body ? (
          <div className="prose mt-10">{slots.body}</div>
        ) : (
          <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}

        {(post.faq.length > 0 || slots.faq) && (
          <section className="mt-12">
            <h2 className="text-negro">{t.post.faqTitle}</h2>
            {slots.faq ?? (
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
            )}
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
