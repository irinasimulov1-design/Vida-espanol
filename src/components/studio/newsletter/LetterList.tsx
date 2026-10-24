"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/i18n/config";
import { listMarkdown } from "@/lib/studio/github";
import {
  emptyLetter,
  history,
  listSizes,
  newsletterReady,
  parseLetter,
  stats,
  type Letter,
  type LetterStats,
  type SentLetter,
} from "@/lib/studio/letters";
import type { LetterTarget } from "./LetterEditor";

const STATUS_STYLE = {
  nacrt: "bg-blanco text-negro",
  zakazano: "bg-oro text-negro",
  poslato: "bg-verde text-blanco",
} as const;

function percent(part: number, whole: number): string {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

function Stats({ token, id }: { token: string; id: string }) {
  const [data, setData] = useState<LetterStats | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    stats(token, id).then(setData, () => setError(true));
  }, [token, id]);

  if (error) return <span className="text-sm text-gris">statistika trenutno nije dostupna</span>;
  if (!data) return <span className="text-sm text-gris">učitavam statistiku…</span>;
  return (
    <span className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
      <span>
        <b className="font-medium">{data.delivered}</b> <span className="text-gris">primilo</span>
      </span>
      <span>
        <b className="font-medium">{percent(data.opened, data.delivered)}</b> <span className="text-gris">otvorilo</span>
      </span>
      <span>
        <b className="font-medium">{percent(data.clicked, data.delivered)}</b> <span className="text-gris">kliknulo</span>
      </span>
      {data.unsubscribed > 0 && (
        <span>
          <b className="font-medium">{data.unsubscribed}</b> <span className="text-gris">odjavilo se</span>
        </span>
      )}
    </span>
  );
}

export default function LetterList({
  token,
  readOnly,
  onOpen,
}: {
  token: string;
  readOnly: boolean;
  onOpen: (target: LetterTarget) => void;
}) {
  const [letters, setLetters] = useState<{ letter: Letter; sha: string }[] | null>(null);
  const [sent, setSent] = useState<SentLetter[]>([]);
  const [sizes, setSizes] = useState<Record<Locale, number> | null>(null);
  const [error, setError] = useState("");
  const [openStats, setOpenStats] = useState<string>("");

  useEffect(() => {
    Promise.all(
      (["sr", "en"] as Locale[]).map(async (lang) =>
        (await listMarkdown(token, `content/pisma/${lang}`)).map((file) => ({
          letter: parseLetter(lang, file.path.split("/").pop()!.replace(/\.md$/, ""), file.text),
          sha: file.sha,
        })),
      ),
    ).then(
      (all) => setLetters(all.flat().sort((a, b) => b.letter.id.localeCompare(a.letter.id))),
      (e) => {
        setError(e instanceof Error ? e.message : "Pisma nisu mogla da se učitaju.");
        setLetters([]);
      },
    );
    if (newsletterReady && !readOnly) {
      history(token).then(setSent, () => {});
      listSizes(token).then(setSizes, () => {});
    }
  }, [token, readOnly]);

  const statusOf = (letter: Letter) => sent.find((s) => s.id === letter.broadcastId)?.status;

  return (
    <main className="mx-auto max-w-300 px-6 py-12 md:py-18">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Pisma</p>
          <h1 className="mt-2">Pisma pretplatnicima</h1>
          {sizes && (
            <p className="mt-3 text-gris">
              Srpska lista: {sizes.sr} · Engleska lista: {sizes.en}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {(["sr", "en"] as Locale[]).map((lang) => (
            <button
              key={lang}
              type="button"
              className={lang === "sr" ? "btn" : "btn btn-ghost"}
              onClick={() => onOpen({ letter: emptyLetter(lang), sha: null })}
            >
              + Pismo {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {!newsletterReady && (
        <p className="mt-8 border border-linija px-5 py-4 text-sm text-gris">
          Slanje još nije podešeno (Worker i Resend, vidi <code>docs/studio.md</code>). Pisma možeš da pišeš i čuvaš kao nacrte.
        </p>
      )}
      {error && <p className="mt-6 text-sm text-rojo">{error}</p>}

      {letters === null ? (
        <p className="mt-10 text-gris">Učitavam pisma…</p>
      ) : letters.length === 0 ? (
        <p className="mt-10 text-gris">
          Još nema pisama. Najlakše je da kreneš od teksta: u „Tekstovi“ klikni „Pismo“ pored objavljenog teksta.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-linija border-t border-linija">
          {letters.map(({ letter, sha }) => {
            const resendStatus = statusOf(letter);
            return (
              <li key={`${letter.lang}/${letter.id}`} className="py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <button type="button" onClick={() => onOpen({ letter, sha })} className="group min-w-0 flex-1 text-left">
                    <span className="flex flex-wrap items-center gap-3">
                      <span className={`eyebrow px-2.5 py-1 text-[11px]! ${STATUS_STYLE[letter.status]}`}>{letter.status}</span>
                      <span className="eyebrow text-gris">{letter.lang}</span>
                      <span className="text-sm text-gris">
                        {letter.sentAt
                          ? new Date(letter.sentAt).toLocaleDateString("sr-Latn")
                          : letter.scheduledAt
                            ? `zakazano ${new Date(letter.scheduledAt).toLocaleString("sr-Latn")}`
                            : letter.id.slice(0, 10)}
                      </span>
                      {resendStatus === "canceled" && <span className="text-sm text-rojo">otkazano</span>}
                    </span>
                    <span className="mt-2 block font-display text-2xl text-negro decoration-naranja decoration-1 underline-offset-4 group-hover:underline">
                      {letter.subject || "(bez naslova)"}
                    </span>
                  </button>
                  {letter.status === "poslato" && letter.broadcastId && newsletterReady && !readOnly && (
                    <button
                      type="button"
                      className="text-sm link"
                      onClick={() => setOpenStats((id) => (id === letter.broadcastId ? "" : letter.broadcastId))}
                    >
                      {openStats === letter.broadcastId ? "Sakrij statistiku" : "Statistika"}
                    </button>
                  )}
                </div>
                {openStats === letter.broadcastId && letter.broadcastId && (
                  <div className="mt-3">
                    <Stats token={token} id={letter.broadcastId} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
