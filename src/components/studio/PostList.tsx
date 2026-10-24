"use client";

import { useState } from "react";
import { formatDate, otherLocale, type Locale } from "@/i18n/config";
import { emptyPost, postStatus, today, type StudioPost } from "@/lib/studio/markdown";
import type { EditTarget } from "./Studio";

export interface LoadedPost {
  post: StudioPost;
  sha: string;
}

const LANG_NAME: Record<Locale, string> = { sr: "Srpski", en: "Engleski" };

const STATUS_STYLE = {
  objavljen: "bg-verde text-blanco",
  nacrt: "bg-hormigon text-negro",
  zakazan: "bg-oro text-negro",
} as const;

export function StatusChip({ post }: { post: Pick<StudioPost, "draft" | "date"> }) {
  const status = postStatus(post);
  return <span className={`eyebrow shrink-0 px-2.5 py-1 text-[11px]! ${STATUS_STYLE[status]}`}>{status}</span>;
}

/** Nova verzija na drugom jeziku: ista slika i povezan `prevod`, tekst se piše (ili AI predlog). */
function translationOf(source: StudioPost): StudioPost {
  return {
    ...emptyPost(otherLocale(source.lang)),
    coverImage: source.coverImage,
    prevod: source.slug,
    date: today(),
    body: "",
  };
}

export default function PostList({
  posts,
  readOnly,
  error,
  onOpen,
}: {
  posts: LoadedPost[] | null;
  readOnly: boolean;
  error: string;
  onOpen: (target: EditTarget) => void;
}) {
  const [lang, setLang] = useState<Locale>("sr");
  const mine = (posts ?? [])
    .filter((p) => p.post.lang === lang)
    .sort((a, b) => b.post.date.localeCompare(a.post.date));
  const partner = (post: StudioPost) =>
    post.prevod ? posts?.find((p) => p.post.lang !== post.lang && p.post.slug === post.prevod) : undefined;

  return (
    <main className="mx-auto max-w-300 px-6 py-12 md:py-18">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-naranja">Blog</p>
          <h1 className="mt-2 text-negro">Tvoji tekstovi</h1>
        </div>
        <button type="button" className="btn" onClick={() => onOpen({ post: emptyPost(lang), sha: null })}>
          + Novi tekst
        </button>
      </div>

      <div role="tablist" className="mt-10 flex gap-6 border-b border-linija">
        {(["sr", "en"] as Locale[]).map((l) => (
          <button
            key={l}
            role="tab"
            aria-selected={lang === l}
            type="button"
            onClick={() => setLang(l)}
            className={`-mb-px border-b-2 pb-3 eyebrow ${lang === l ? "border-naranja text-negro" : "border-transparent text-negro/50"}`}
          >
            {LANG_NAME[l]} · {(posts ?? []).filter((p) => p.post.lang === l).length}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 text-sm text-rojo">{error}</p>}
      {readOnly && (
        <p className="mt-6 text-sm text-negro/60">Samo pregled: možeš da otvoriš i menjaš tekst, ali čuvanje je isključeno.</p>
      )}

      {posts === null ? (
        <p className="mt-10 text-negro/60">Učitavam tekstove…</p>
      ) : mine.length === 0 ? (
        <p className="mt-10 text-negro/60">Još nema tekstova na ovom jeziku.</p>
      ) : (
        <ul className="mt-2 divide-y divide-linija">
          {mine.map(({ post, sha }) => {
            const pair = partner(post);
            return (
              <li key={post.slug} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:gap-6">
                <button type="button" onClick={() => onOpen({ post, sha })} className="group min-w-0 flex-1 text-left">
                  <span className="flex flex-wrap items-center gap-3">
                    <StatusChip post={post} />
                    <span className="text-sm text-negro/60">{formatDate(post.date, "sr")}</span>
                  </span>
                  <span className="mt-2 block font-display text-2xl text-negro decoration-naranja decoration-1 underline-offset-4 group-hover:underline">
                    {post.title || "(bez naslova)"}
                  </span>
                </button>
                <div className="text-sm">
                  {pair ? (
                    <button type="button" className="link" onClick={() => onOpen({ post: pair.post, sha: pair.sha })}>
                      {LANG_NAME[pair.post.lang]} verzija →
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-ghost px-4! py-3!"
                      onClick={() => onOpen({ post: translationOf(post), sha: null, source: post })}
                    >
                      + {otherLocale(post.lang) === "en" ? "Engleska" : "Srpska"} verzija
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
