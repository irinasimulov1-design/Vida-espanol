"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PostView from "@/components/PostView";
import PostCard from "@/components/PostCard";
import { getDictionary } from "@/i18n";
import { otherLocale } from "@/i18n/config";
import { postHref } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";
import { suggestTranslation } from "@/lib/studio/auth";
import {
  blobSha,
  commitFiles,
  ConflictError,
  deployState,
  publishesToSite,
  rawPrefix,
  readFile,
  type CommitFile,
  type DeployState,
} from "@/lib/studio/github";
import { prepareImage, type PreparedImage } from "@/lib/studio/image";
import { parsePost, postPath, postStatus, serializePost, today, type StudioPost } from "@/lib/studio/markdown";
import { slugify } from "@/lib/studio/slug";
import { AutoText, CategoriesEditor, FaqEditor, FileButton } from "./Fields";
import { BodyContent, Toolbar, useBodyEditor } from "./RichBody";
import SeoPanel from "./SeoPanel";
import { StatusChip, type LoadedPost } from "./PostList";
import type { EditTarget } from "./Studio";

// U editoru slike iz repoa idu preko raw.githubusercontent (da se vide i pre deploya),
// a nove slike preko blob: URL-a; u .md fajl uvek ide putanja sa sajta (/blog/...).
const IMAGE_IN_MD = /(!\[[^\]]*\]\()(\/[^)\s]+)/g;

function toEditorMarkdown(md: string): string {
  return md.replace(IMAGE_IN_MD, (_, start: string, path: string) => `${start}${rawPrefix()}${encodeURI(path)}`);
}

function fromEditorMarkdown(md: string, images: PreparedImage[]): string {
  let out = md;
  for (const image of images) out = out.split(image.previewUrl).join(image.publicPath);
  return out.split(rawPrefix()).join("").replace(/(!\[[^\]]*\]\()(\/[^)\s]+)/g, (all, start: string, path: string) => {
    const decoded = decodeURI(path);
    return /\s/.test(decoded) ? all : `${start}${decoded}`;
  });
}

const LOCAL_PREFIX = "vida-studio-nacrt:";

function readLocal(key: string): { post: StudioPost; at: number } | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; commit: string; deploy: DeployState; status: ReturnType<typeof postStatus> }
  | { kind: "error"; message: string };

export default function Editor({
  target,
  token,
  readOnly,
  posts,
  onClose,
}: {
  target: EditTarget;
  token: string;
  readOnly: boolean;
  posts: LoadedPost[];
  onClose: () => void;
}) {
  const [post, setPost] = useState<StudioPost>(target.post);
  const [sha, setSha] = useState<string | null>(target.sha);
  const [savedText, setSavedText] = useState(() => (target.sha ? serializePost(target.post) : ""));
  const [slugTouched, setSlugTouched] = useState(!!target.sha);
  const [markUpdated, setMarkUpdated] = useState(false);
  const [images, setImages] = useState<PreparedImage[]>([]);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [aiBusy, setAiBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const isNew = sha === null;
  const t = getDictionary(post.lang);
  const localKey = `${LOCAL_PREFIX}${post.lang}:${target.sha ? target.post.slug : "novi"}`;

  // Editor čita listu novih slika iz callback-a, pa mu treba uvek sveža (ref, ne state).
  const imagesRef = useRef<PreparedImage[]>([]);
  const editor = useBodyEditor(toEditorMarkdown(target.post.body), (md) =>
    setPost((p) => ({ ...p, body: fromEditorMarkdown(md, imagesRef.current) })),
  );

  const update = (patch: Partial<StudioPost>) =>
    setPost((p) => {
      const next = { ...p, ...patch };
      if (patch.title !== undefined && !slugTouched) next.slug = slugify(patch.title);
      return next;
    });

  const text = useMemo(() => serializePost(post), [post]);
  const dirty = text !== savedText;

  // Nesačuvane izmene se čuvaju u browseru, da ne propadnu ako se tab zatvori.
  const [restore, setRestore] = useState(() => {
    const local = typeof window === "undefined" ? null : readLocal(localKey);
    return local && serializePost(local.post) !== serializePost(target.post) ? local : null;
  });
  useEffect(() => {
    if (!dirty || restore) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(localKey, JSON.stringify({ post, at: Date.now() }));
      } catch {}
    }, 800);
    return () => window.clearTimeout(timer);
  }, [post, dirty, restore, localKey]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Posle objave na master: prati GitHub Actions dok sajt ne bude osvežen.
  useEffect(() => {
    if (save.kind !== "saved" || !publishesToSite || save.deploy === "done" || save.deploy === "failed") return;
    const timer = window.setTimeout(async () => {
      try {
        const deploy = await deployState(token, save.commit);
        setSave((s) => (s.kind === "saved" ? { ...s, deploy } : s));
      } catch {}
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [save, token]);

  const categorySuggestions = useMemo(
    () => [...new Set(posts.filter((p) => p.post.lang === post.lang).flatMap((p) => p.post.categories))].sort(),
    [posts, post.lang],
  );
  const coverLibrary = useMemo(
    () => [...new Set(posts.map((p) => p.post.coverImage).filter(Boolean))],
    [posts],
  );
  const hasPair = !!post.prevod && posts.some((p) => p.post.lang !== post.lang && p.post.slug === post.prevod);

  function previewSrc(path: string): string {
    return images.find((i) => i.publicPath === path)?.previewUrl ?? (path ? `${rawPrefix()}${encodeURI(path)}` : "");
  }

  async function addImage(file: File, asCover: boolean) {
    try {
      const image = await prepareImage(file, post.slug);
      imagesRef.current = [...imagesRef.current, image];
      setImages(imagesRef.current);
      if (asCover) {
        update({ coverImage: image.publicPath });
      } else {
        const alt = window.prompt("Kratak opis fotografije (za Google i slabovide):", "") ?? "";
        editor?.chain().focus().setImage({ src: image.previewUrl, alt }).run();
      }
    } catch {
      setSave({ kind: "error", message: "Fotografija nije mogla da se učita." });
    }
  }

  async function aiSuggest() {
    if (!target.source) return;
    setAiBusy(true);
    try {
      const md = await suggestTranslation(token, serializePost(target.source));
      const draft = parsePost(post.lang, "", md);
      const next: StudioPost = {
        ...post,
        title: draft.title,
        excerpt: draft.excerpt,
        ukratko: draft.ukratko,
        faq: draft.faq,
        categories: draft.categories,
        body: draft.body,
        slug: slugTouched ? post.slug : slugify(draft.title),
      };
      setPost(next);
      editor?.commands.setContent(toEditorMarkdown(draft.body), { contentType: "markdown" });
    } catch (e) {
      setSave({ kind: "error", message: e instanceof Error ? e.message : "AI predlog nije uspeo." });
    } finally {
      setAiBusy(false);
    }
  }

  async function onSave() {
    if (readOnly) return;
    if (!post.title.trim()) return setSave({ kind: "error", message: "Tekst treba naslov." });
    if (!post.slug) return setSave({ kind: "error", message: "Tekst treba adresu (slug)." });
    if (isNew && posts.some((p) => p.post.lang === post.lang && p.post.slug === post.slug)) {
      return setSave({ kind: "error", message: "Već postoji tekst sa ovom adresom. Promeni adresu." });
    }

    setSave({ kind: "saving" });
    try {
      const final: StudioPost = { ...post, updated: markUpdated ? today() : post.updated };
      const finalText = serializePost(final);
      const path = postPath(final.lang, final.slug);
      const files: CommitFile[] = [{ path, text: finalText, expectedSha: sha }];

      for (const image of images) {
        if (finalText.includes(image.publicPath)) files.push({ path: `public${image.publicPath}`, base64: image.base64 });
      }

      // Prevod se povezuje u oba smera, u istom commitu.
      if (final.prevod) {
        const otherPath = postPath(otherLocale(final.lang), final.prevod);
        const other = await readFile(token, otherPath);
        if (other) {
          const otherPost = parsePost(otherLocale(final.lang), final.prevod, other.text);
          if (otherPost.prevod !== final.slug) {
            files.push({ path: otherPath, text: serializePost({ ...otherPost, prevod: final.slug }), expectedSha: other.sha });
          }
        }
      }

      const status = postStatus(final);
      const verb = { nacrt: "sačuvaj nacrt", zakazan: `zakaži za ${final.date}`, objavljen: isNew ? "objavi" : "izmeni" }[status];
      const commit = await commitFiles(token, files, `Studio: ${verb} „${final.title.trim()}“`);

      setPost(final);
      setSha(await blobSha(finalText));
      setSavedText(finalText);
      setSlugTouched(true);
      setMarkUpdated(false);
      setRestore(null);
      try {
        localStorage.removeItem(localKey);
      } catch {}
      setSave({ kind: "saved", commit, deploy: "queued", status });
    } catch (e) {
      setSave({
        kind: "error",
        message:
          e instanceof ConflictError
            ? "Ovaj tekst je u međuvremenu izmenjen na drugom mestu. Kopiraj svoje izmene, zatvori i otvori tekst ponovo."
            : e instanceof Error
              ? e.message
              : "Čuvanje nije uspelo.",
      });
    }
  }

  const status = postStatus(post);
  const saveLabel = { nacrt: "Sačuvaj nacrt", zakazan: "Zakaži", objavljen: isNew || target.post.draft ? "Objavi" : "Sačuvaj izmene" }[status];
  const view = { ...post, coverImage: previewSrc(post.coverImage) };

  const coverControls = (
    <div
      className={
        post.coverImage
          ? "absolute right-4 top-4 z-10 flex gap-2"
          : "mb-8 flex flex-col items-center gap-3 border border-dashed border-negro/30 px-6 py-10 text-center"
      }
    >
      {!post.coverImage && <p className="text-sm text-negro/60">Naslovna fotografija (preporučeno)</p>}
      <div className="flex flex-wrap justify-center gap-2">
        <FileButton onFile={(f) => addImage(f, true)} className={`btn ${post.coverImage ? "btn-ghost btn-ghost-light" : "btn-ghost"} px-4! py-2.5!`}>
          {post.coverImage ? "Promeni" : "Dodaj fotografiju"}
        </FileButton>
        {coverLibrary.length > 0 && (
          <select
            aria-label="Izaberi postojeću fotografiju"
            value=""
            onChange={(e) => e.target.value && update({ coverImage: e.target.value })}
            className={`eyebrow border px-3 py-2 ${post.coverImage ? "border-blanco bg-negro/40 text-blanco" : "border-negro bg-transparent text-negro"}`}
          >
            <option value="">Iz biblioteke</option>
            {coverLibrary.map((src) => (
              <option key={src} value={src}>
                {src.split("/").pop()}
              </option>
            ))}
          </select>
        )}
        {post.coverImage && (
          <button type="button" onClick={() => update({ coverImage: "" })} className="btn btn-ghost btn-ghost-light px-4! py-2.5!">
            Ukloni
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blanco">
      {/* Gornja traka: nazad, status, čuvanje */}
      <div className="sticky top-0 z-40 border-b border-linija bg-blanco/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              className="text-sm link"
              onClick={() => (!dirty || window.confirm("Imaš nesačuvane izmene. Izađi svejedno?")) && onClose()}
            >
              ← Svi tekstovi
            </button>
            <StatusChip post={post} />
            <span className="eyebrow hidden text-negro/50 sm:inline">{post.lang === "sr" ? "Srpski" : "Engleski"}</span>
            {dirty && <span className="hidden text-sm text-negro/50 md:inline">nesačuvane izmene</span>}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="text-sm link lg:hidden" onClick={() => setPanelOpen((o) => !o)}>
              {panelOpen ? "Sakrij podešavanja" : "Podešavanja i SEO"}
            </button>
            <button
              type="button"
              className="btn px-5! py-3!"
              disabled={readOnly || save.kind === "saving" || (!dirty && !isNew)}
              onClick={onSave}
            >
              {save.kind === "saving" ? "Čuvam…" : saveLabel}
            </button>
          </div>
        </div>
        <div className="border-t border-linija px-4 py-1.5 md:px-6">
          <Toolbar editor={editor} onImage={(f) => addImage(f, false)} />
        </div>
        <SaveBanner save={save} post={post} onDismiss={() => setSave({ kind: "idle" })} />
        {restore && (
          <div className="flex flex-wrap items-center justify-center gap-4 bg-oro/40 px-4 py-2 text-sm">
            <span>Imaš nesačuvanu verziju od {new Date(restore.at).toLocaleString("sr-Latn")}.</span>
            <button
              type="button"
              className="link"
              onClick={() => {
                setPost(restore.post);
                editor?.commands.setContent(toEditorMarkdown(restore.post.body), { contentType: "markdown" });
                setRestore(null);
              }}
            >
              Vrati je
            </button>
            <button
              type="button"
              className="link"
              onClick={() => {
                try {
                  localStorage.removeItem(localKey);
                } catch {}
                setRestore(null);
              }}
            >
              Odbaci
            </button>
          </div>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
          {target.source && isNew && (
            <div className="flex flex-wrap items-center justify-center gap-4 border-b border-linija bg-papel px-6 py-4 text-sm">
              <span>
                {post.lang === "en" ? "Engleska" : "Srpska"} verzija teksta „{target.source.title}“.
              </span>
              <button type="button" className="btn btn-ghost px-4! py-2.5!" disabled={aiBusy || readOnly} onClick={aiSuggest}>
                {aiBusy ? "AI piše predlog…" : "AI predlog za doradu"}
              </button>
            </div>
          )}
          <PostView
            post={view}
            t={t}
            slots={{
              cover: coverControls,
              title: (
                <AutoText value={post.title} onChange={(title) => update({ title })} placeholder="Naslov — jasno pitanje ili obećanje" />
              ),
              categories: (
                <CategoriesEditor
                  value={post.categories}
                  suggestions={categorySuggestions}
                  onChange={(categories) => update({ categories })}
                  light={!!post.coverImage}
                />
              ),
              summary: (
                <div className="mt-2 leading-relaxed text-negro">
                  <AutoText
                    value={post.ukratko}
                    onChange={(ukratko) => update({ ukratko })}
                    placeholder="Direktan odgovor na naslov u 2–3 rečenice, bez uvoda."
                  />
                </div>
              ),
              body: <BodyContent editor={editor} />,
              faq: <FaqEditor value={post.faq} onChange={(faq) => update({ faq })} />,
            }}
          />
        </div>

        <aside
          className={`${panelOpen ? "block" : "hidden"} border-t border-linija bg-papel px-6 py-8 lg:sticky lg:top-27 lg:block lg:h-[calc(100vh-6.75rem)] lg:overflow-y-auto lg:border-t-0 lg:border-l`}
        >
          <p className="eyebrow">Objava</p>
          <div className="mt-4 grid grid-cols-2 border border-negro text-center text-sm">
            {[
              { draft: true, label: "Nacrt" },
              { draft: false, label: "Na sajt" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => update({ draft: option.draft })}
                className={`py-2 ${post.draft === option.draft ? "bg-negro text-blanco" : "text-negro"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm text-negro/70">
            Datum objave
            <input
              type="date"
              value={post.date}
              onChange={(e) => update({ date: e.target.value })}
              className="mt-1 block w-full border border-linija bg-blanco px-3 py-2 text-negro"
            />
          </label>
          {status === "zakazan" && (
            <p className="mt-2 text-sm text-negro/70">Tekst će se sam pojaviti ujutru {post.date.split("-").reverse().join(".")}.</p>
          )}
          {!isNew && !post.draft && (
            <label className="mt-3 flex items-center gap-2 text-sm text-negro/80">
              <input type="checkbox" checked={markUpdated} onChange={(e) => setMarkUpdated(e.target.checked)} />
              Označi kao „Ažurirano danas“
            </label>
          )}

          <label className="mt-6 block text-sm text-negro/70">
            Opis za Google i karticu
            <textarea
              rows={3}
              value={post.excerpt}
              onChange={(e) => update({ excerpt: e.target.value })}
              className="mt-1 block w-full resize-y border border-linija bg-blanco px-3 py-2 text-negro"
              placeholder="Jedna rečenica (do ~155 znakova)."
            />
          </label>

          <label className="mt-4 block text-sm text-negro/70">
            Adresa
            <span className="mt-1 flex items-center border border-linija bg-blanco text-negro">
              <span className="pl-3 text-negro/40">/{post.lang}/blog/</span>
              <input
                value={post.slug}
                disabled={!isNew}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({ slug: slugify(e.target.value) });
                }}
                className="min-w-0 flex-1 bg-transparent py-2 pr-3 outline-none disabled:text-negro/60"
              />
            </span>
            {!isNew && <span className="mt-1 block text-xs">Adresa objavljenog teksta se ne menja (linkovi bi se pokvarili).</span>}
          </label>

          <label className="mt-4 block text-sm text-negro/70">
            {post.lang === "sr" ? "Engleska" : "Srpska"} verzija
            <select
              value={post.prevod}
              onChange={(e) => update({ prevod: e.target.value })}
              className="mt-1 block w-full border border-linija bg-blanco px-3 py-2 text-negro"
            >
              <option value="">— nema —</option>
              {posts
                .filter((p) => p.post.lang !== post.lang)
                .map((p) => (
                  <option key={p.post.slug} value={p.post.slug}>
                    {p.post.title}
                  </option>
                ))}
            </select>
          </label>

          <div className="mt-8 border-t border-linija pt-8">
            <SeoPanel post={post} hasPair={hasPair || (!!post.prevod && !!target.source)} />
          </div>

          <div className="mt-8 border-t border-linija pt-8">
            <p className="eyebrow">Kartica na blogu</p>
            <div className="pointer-events-none mt-4">
              <PostCard post={{ ...view, excerpt: post.excerpt, prevod: post.prevod }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SaveBanner({ save, post, onDismiss }: { save: SaveState; post: StudioPost; onDismiss: () => void }) {
  if (save.kind === "error") {
    return (
      <div className="flex items-center justify-center gap-4 bg-rojo px-4 py-2 text-sm text-blanco">
        <span>{save.message}</span>
        <button type="button" onClick={onDismiss} aria-label="Zatvori">
          ×
        </button>
      </div>
    );
  }
  if (save.kind !== "saved") return null;

  const url = absoluteUrl(postHref(post.lang, post.slug));
  let message: React.ReactNode;
  if (!publishesToSite) message = "Sačuvano u probnu granu (ne ide na sajt).";
  else if (save.status === "nacrt") message = "Nacrt je sačuvan. Na sajtu se ne vidi.";
  else if (save.status === "zakazan") message = `Zakazano. Pojaviće se ${post.date.split("-").reverse().join(".")}.`;
  else if (save.deploy === "done")
    message = (
      <>
        Objavljeno ✓{" "}
        <a href={url} target="_blank" rel="noopener noreferrer" className="link">
          Pogledaj na sajtu
        </a>
      </>
    );
  else if (save.deploy === "failed") message = "Sačuvano, ali objava sajta nije uspela. Javi se za pomoć.";
  else message = "Sačuvano. Sajt se osvežava (1–2 minuta)…";

  return (
    <div className="flex items-center justify-center gap-4 bg-verde px-4 py-2 text-sm text-blanco">
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Zatvori">
        ×
      </button>
    </div>
  );
}
