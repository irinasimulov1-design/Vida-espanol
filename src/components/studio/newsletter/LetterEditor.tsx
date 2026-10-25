"use client";

import { useEffect, useMemo, useState } from "react";
import { commitFiles, ConflictError, blobSha } from "@/lib/studio/github";
import {
  cancelLetter,
  contentHash,
  emailStatus,
  letterPath,
  listSizes,
  newLetterId,
  newsletterReady,
  sendLetter,
  sendTest,
  serializeLetter,
  type Letter,
} from "@/lib/studio/letters";
import { slugify } from "@/lib/studio/slug";
import { renderEmail, type FeaturedPost } from "@/lib/newsletter/template";
import type { Locale } from "@/i18n/config";
import { BodyContent, Toolbar, useBodyEditor } from "../RichBody";
import type { LoadedPost } from "../PostList";

export interface LetterTarget {
  letter: Letter;
  /** sha fajla nacrta; null = još nije sačuvan */
  sha: string | null;
}

const LIST_NAME: Record<Locale, string> = { sr: "srpsku listu", en: "englesku listu" };

function people(n: number): string {
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? `${n} osobe` : `${n} osoba`;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("sr-Latn", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

type Banner = { kind: "ok" | "error"; text: string } | null;

export default function LetterEditor({
  target,
  token,
  readOnly,
  posts,
  onClose,
}: {
  target: LetterTarget;
  token: string;
  readOnly: boolean;
  posts: LoadedPost[];
  onClose: () => void;
}) {
  const [letter, setLetter] = useState<Letter>(target.letter);
  const [sha, setSha] = useState<string | null>(target.sha);
  const [savedText, setSavedText] = useState(() => (target.sha ? serializeLetter(target.letter) : ""));
  const [bodyHtml, setBodyHtml] = useState("");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [sizes, setSizes] = useState<Record<Locale, number> | null>(null);
  const [testedHash, setTestedHash] = useState("");
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "test" | "send" | "cancel">("");
  const [banner, setBanner] = useState<Banner>(null);
  const [confirming, setConfirming] = useState(false);
  const [when, setWhen] = useState<"now" | "later">("now");
  const [scheduleAt, setScheduleAt] = useState("");

  const locked = letter.status !== "nacrt";
  const update = (patch: Partial<Letter>) => setLetter((l) => ({ ...l, ...patch }));

  const editor = useBodyEditor(
    target.letter.body,
    (body) => setLetter((l) => ({ ...l, body })),
    "Hola, … napiši par ličnih rečenica: šta je novo, zašto ti je važno i kome će pomoći.",
  );

  // Telo pisma kao HTML (za šablon) prati editor; poslato pismo se više ne menja.
  useEffect(() => {
    if (!editor) return;
    const sync = () => setBodyHtml(editor.getHTML());
    sync();
    editor.setEditable(!locked);
    editor.on("update", sync);
    return () => {
      editor.off("update", sync);
    };
  }, [editor, locked]);

  useEffect(() => {
    if (!newsletterReady || readOnly) return;
    listSizes(token).then(setSizes, () => {});
  }, [token, readOnly]);

  const postsInLang = posts.filter((p) => p.post.lang === letter.lang && !p.post.draft);
  const featured: FeaturedPost | null = useMemo(() => {
    const found = posts.find((p) => p.post.lang === letter.lang && p.post.slug === letter.post)?.post;
    return found ?? null;
  }, [posts, letter.lang, letter.post]);

  const html = useMemo(
    () =>
      renderEmail({
        lang: letter.lang,
        subject: letter.subject || "(bez naslova)",
        preheader: letter.preheader,
        bodyHtml: bodyHtml === "<p></p>" ? "" : bodyHtml,
        post: featured,
        campaign: letter.id || slugify(letter.subject) || "pismo",
      }),
    [letter.lang, letter.subject, letter.preheader, letter.id, bodyHtml, featured],
  );

  useEffect(() => {
    let alive = true;
    contentHash(letter.lang, letter.subject, html).then((h) => alive && setHash(h));
    return () => {
      alive = false;
    };
  }, [letter.lang, letter.subject, html]);

  const text = useMemo(() => serializeLetter(letter), [letter]);
  const dirty = text !== savedText;
  const tested = !!hash && hash === testedHash;

  async function save(next: Letter, message: string): Promise<boolean> {
    const withId = next.id ? next : { ...next, id: newLetterId(next.subject) };
    const nextText = serializeLetter(withId);
    try {
      await commitFiles(token, [{ path: letterPath(withId), text: nextText, expectedSha: sha }], message);
      setLetter(withId);
      setSha(await blobSha(nextText));
      setSavedText(nextText);
      return true;
    } catch (e) {
      setBanner({
        kind: "error",
        text:
          e instanceof ConflictError
            ? "Ovo pismo je u međuvremenu izmenjeno na drugom mestu. Zatvori ga i otvori ponovo."
            : e instanceof Error
              ? e.message
              : "Čuvanje nije uspelo.",
      });
      return false;
    }
  }

  async function onSave() {
    if (!letter.subject.trim()) return setBanner({ kind: "error", text: "Pismu treba naslov." });
    setBusy("save");
    if (await save(letter, `Studio: nacrt pisma „${letter.subject.trim()}“`)) {
      setBanner({ kind: "ok", text: "Nacrt je sačuvan." });
    }
    setBusy("");
  }

  /** Prati probu u Resend-u ~40 s, da Irina vidi da li je isporučena ili zašto nije. */
  async function followTest(id: string, to: string) {
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 4000));
      let event = "";
      try {
        event = (await emailStatus(token, id)).lastEvent;
      } catch {
        return;
      }
      if (event === "delivered" || event === "opened" || event === "clicked") {
        return setBanner({
          kind: "ok",
          text: `Proba je isporučena na ${to}. Ako je ne vidiš u inboxu, pogledaj Spam i Promocije.`,
        });
      }
      if (event === "bounced") {
        return setBanner({ kind: "error", text: `Server adrese ${to} je odbio probu. Proveri da li je adresa tačna.` });
      }
      if (event === "suppressed") {
        return setBanner({
          kind: "error",
          text: `Resend ne šalje na ${to}: adresa je na listi blokiranih (ranije vraćeno pismo ili prijava kao spam). Skini je u Resend → Suppressions.`,
        });
      }
      if (event === "complained") {
        return setBanner({ kind: "error", text: `Pismo na ${to} je ranije prijavljeno kao spam, pa Resend ne šalje dalje.` });
      }
      if (event === "failed") {
        return setBanner({ kind: "error", text: `Slanje na ${to} nije uspelo u Resend-u. Pogledaj Resend → Emails.` });
      }
    }
    setBanner({ kind: "ok", text: `Proba je poslata na ${to}, ali isporuka još nije potvrđena. Pogledaj Resend → Emails.` });
  }

  async function onTest() {
    if (!letter.subject.trim()) return setBanner({ kind: "error", text: "Pismu treba naslov." });
    setBusy("test");
    try {
      const res = await sendTest(token, letter.subject.trim(), html);
      setTestedHash(hash);
      setBanner({ kind: "ok", text: `Proba je poslata na ${res.to}. Proveravam da li je stigla…` });
      followTest(res.id, res.to);
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Proba nije poslata." });
    }
    setBusy("");
  }

  async function onSend() {
    const scheduledAt = when === "later" && scheduleAt ? new Date(scheduleAt).toISOString() : undefined;
    if (when === "later" && (!scheduledAt || new Date(scheduledAt).getTime() < Date.now() + 5 * 60 * 1000)) {
      return setBanner({ kind: "error", text: "Izaberi vreme bar 5 minuta od sada." });
    }
    setBusy("send");
    setConfirming(false);
    try {
      const subject = letter.subject.trim();
      const { id } = await sendLetter(token, {
        lang: letter.lang,
        subject,
        html,
        name: `${letter.lang.toUpperCase()} · ${subject}`,
        scheduledAt,
      });
      const sent: Letter = {
        ...letter,
        id: letter.id || newLetterId(subject),
        status: scheduledAt ? "zakazano" : "poslato",
        broadcastId: id,
        scheduledAt: scheduledAt ?? "",
        sentAt: scheduledAt ? "" : new Date().toISOString(),
      };
      // Pismo je već na putu; zapis u repou je samo istorija, pa njegov neuspeh ne poništava slanje.
      await save(sent, `Studio: ${scheduledAt ? "zakaži" : "pošalji"} pismo „${subject}“`);
      setLetter(sent);
      setBanner({
        kind: "ok",
        text: scheduledAt ? `Zakazano za ${formatWhen(scheduledAt)}.` : "Pismo je poslato. ¡Enhorabuena!",
      });
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Slanje nije uspelo." });
    }
    setBusy("");
  }

  async function onCancel() {
    if (!window.confirm("Otkaži zakazano slanje? Pismo se vraća u nacrt.")) return;
    setBusy("cancel");
    try {
      await cancelLetter(token, letter.broadcastId);
      const back: Letter = { ...letter, status: "nacrt", broadcastId: "", scheduledAt: "" };
      await save(back, `Studio: otkaži pismo „${letter.subject.trim()}“`);
      setLetter(back);
      setTestedHash("");
      setBanner({ kind: "ok", text: "Slanje je otkazano. Pismo je ponovo nacrt." });
    } catch (e) {
      setBanner({ kind: "error", text: e instanceof Error ? e.message : "Otkazivanje nije uspelo." });
    }
    setBusy("");
  }

  const canSend = newsletterReady && !readOnly && !locked && tested && !busy;
  const size = sizes?.[letter.lang];

  return (
    <div className="min-h-screen bg-fondo">
      <div className="sticky top-0 z-40 border-b border-linija bg-fondo/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              className="text-sm link"
              onClick={() => (!dirty || locked || window.confirm("Imaš nesačuvane izmene. Izađi svejedno?")) && onClose()}
            >
              ← Sva pisma
            </button>
            <span className="eyebrow text-gris">
              {letter.status === "nacrt" ? "Nacrt" : letter.status === "zakazano" ? "Zakazano" : "Poslato"} ·{" "}
              {letter.lang === "sr" ? "Srpski" : "Engleski"}
            </span>
            {dirty && !locked && <span className="hidden text-sm text-gris md:inline">nesačuvane izmene</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {letter.status === "zakazano" && (
              <button type="button" className="btn btn-ghost px-4! py-3!" disabled={!!busy} onClick={onCancel}>
                Otkaži slanje
              </button>
            )}
            {!locked && (
              <>
                <button type="button" className="text-sm link" disabled={readOnly || !!busy} onClick={onSave}>
                  {busy === "save" ? "Čuvam…" : "Sačuvaj nacrt"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost px-4! py-3!"
                  disabled={readOnly || !newsletterReady || !!busy}
                  onClick={onTest}
                >
                  {busy === "test" ? "Šaljem probu…" : "Pošalji meni probu"}
                </button>
                <button
                  type="button"
                  className="btn px-5! py-3!"
                  disabled={!canSend}
                  title={tested ? undefined : "Prvo pošalji probu za ovu verziju pisma."}
                  onClick={() => setConfirming(true)}
                >
                  {busy === "send" ? "Šaljem…" : "Pošalji svima"}
                </button>
              </>
            )}
          </div>
        </div>
        {!locked && (
          <div className="border-t border-linija px-4 py-1.5 md:px-6">
            <Toolbar editor={editor} />
          </div>
        )}
        {banner && (
          <div
            className={`flex items-center justify-center gap-4 px-4 py-2 text-sm text-blanco ${banner.kind === "ok" ? "bg-verde" : "bg-rojo"}`}
          >
            <span>{banner.text}</span>
            <button type="button" onClick={() => setBanner(null)} aria-label="Zatvori">
              ×
            </button>
          </div>
        )}
        {!locked && !tested && newsletterReady && !readOnly && (
          <p className="bg-blanco px-4 py-1.5 text-center text-xs text-gris">
            „Pošalji svima“ se otključava kad pošalješ sebi probu ove verzije pisma.
          </p>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-negro/40 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md border border-linija bg-fondo p-8">
            <p className="eyebrow text-gris">Poslednja provera</p>
            <h2 className="mt-3 text-3xl!">„{letter.subject.trim()}“</h2>
            <p className="mt-4">
              Ide na {LIST_NAME[letter.lang]}
              {size !== undefined && <> — {people(size)}</>}.
            </p>
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={when === "now"} onChange={() => setWhen("now")} /> Pošalji sada
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={when === "later"} onChange={() => setWhen("later")} /> Zakaži za
                <input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => {
                    setScheduleAt(e.target.value);
                    setWhen("later");
                  }}
                  className="border border-linija bg-papel px-2 py-1"
                />
              </label>
            </div>
            <div className="mt-8 flex items-center justify-end gap-6">
              <button type="button" className="text-sm link" onClick={() => setConfirming(false)}>
                Ne još
              </button>
              <button type="button" className="btn" onClick={onSend}>
                {when === "now" ? "Pošalji" : "Zakaži"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 border-linija px-6 py-10 lg:border-r md:px-10">
          <label className="block">
            <span className="eyebrow text-gris">Naslov pisma</span>
            <input
              value={letter.subject}
              disabled={locked}
              onChange={(e) => update({ subject: e.target.value })}
              placeholder="Npr. „Ser ili estar — trik od 10 sekundi“"
              className="mt-2 block w-full border-0 border-b border-negro/30 bg-transparent py-2 font-display text-3xl text-negro outline-none focus:border-negro"
            />
            <span className="mt-1 block text-xs text-gris">{letter.subject.length} znakova · najbolje do ~50</span>
          </label>
          <label className="mt-6 block">
            <span className="eyebrow text-gris">Prvi red u inboxu</span>
            <input
              value={letter.preheader}
              disabled={locked}
              onChange={(e) => update({ preheader: e.target.value })}
              placeholder="Rečenica koja se vidi pored naslova, pre otvaranja."
              className="mt-2 block w-full border-0 border-b border-negro/30 bg-transparent py-2 text-negro outline-none focus:border-negro"
            />
          </label>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="eyebrow text-gris">Lista</span>
              <select
                value={letter.lang}
                disabled={locked || !!letter.id}
                onChange={(e) => update({ lang: e.target.value as Locale, post: "" })}
                className="mt-2 block w-full border border-linija bg-papel px-3 py-2"
              >
                <option value="sr">Srpska{sizes ? ` · ${people(sizes.sr)}` : ""}</option>
                <option value="en">Engleska{sizes ? ` · ${people(sizes.en)}` : ""}</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="eyebrow text-gris">Tekst sa bloga</span>
              <select
                value={letter.post}
                disabled={locked}
                onChange={(e) => update({ post: e.target.value })}
                className="mt-2 block w-full border border-linija bg-papel px-3 py-2"
              >
                <option value="">— bez kartice —</option>
                {postsInLang.map((p) => (
                  <option key={p.post.slug} value={p.post.slug}>
                    {p.post.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-10">
            <span className="eyebrow text-gris">Pismo</span>
            <div className="prose mt-3 border-t border-linija pt-6">
              <BodyContent editor={editor} />
            </div>
            {featured && (
              <p className="mt-6 border-l border-naranja pl-4 text-sm text-gris">
                Ispod tvog teksta ide kartica „{featured.title}“ sa dugmetom za čitanje, pa potpis.
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 bg-blanco px-4 py-10 md:px-8">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-gris">Ovako stiže u inbox</span>
            <div className="flex border border-negro text-xs">
              {(["desktop", "phone"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`px-3 py-1.5 ${device === d ? "bg-negro text-blanco" : "text-negro"}`}
                >
                  {d === "desktop" ? "Računar" : "Telefon"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 border border-linija bg-papel px-4 py-3 text-sm">
            <p className="font-medium text-negro">{letter.subject || "(bez naslova)"}</p>
            <p className="truncate text-gris">{letter.preheader || "…"}</p>
          </div>
          <iframe
            title="Pregled pisma"
            srcDoc={html}
            // Bez skripti; same-origin samo da bi se pregled iscrtao u svim browserima.
            sandbox="allow-same-origin"
            className="mx-auto mt-4 block h-[75vh] border border-linija bg-fondo transition-[width]"
            style={{ width: device === "desktop" ? "100%" : 375, maxWidth: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
