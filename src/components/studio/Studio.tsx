"use client";

import { useCallback, useEffect, useState } from "react";
import Logo from "@/components/Logo";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { forgetToken, login, savedToken } from "@/lib/studio/auth";
import { getUser, listMarkdown, publishesToSite, type StudioUser } from "@/lib/studio/github";
import { parsePost, type StudioPost } from "@/lib/studio/markdown";
import PostList, { type LoadedPost } from "./PostList";
import Editor from "./Editor";

export interface EditTarget {
  post: StudioPost;
  /** sha fajla kad je otvoren; null = novi post */
  sha: string | null;
  /** post na drugom jeziku iz kog se pravi prevod (za AI predlog) */
  source?: StudioPost;
}

type Session = { token: string; user: StudioUser | null; readOnly: boolean };

export default function Studio() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState<LoadedPost[] | null>(null);
  const [editing, setEditing] = useState<EditTarget | null>(null);

  const start = useCallback(async (token: string) => {
    setError("");
    try {
      const user = await getUser(token);
      if (!user.canWrite) {
        forgetToken();
        setError(`Nalog ${user.login} nema pravo izmene sajta.`);
        return;
      }
      setSession({ token, user, readOnly: false });
    } catch {
      forgetToken();
      setError("Prijava je istekla. Prijavi se ponovo.");
    }
  }, []);

  useEffect(() => {
    const token = savedToken();
    // Token iz sessionStorage se proverava jednom pri otvaranju Studija.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!token) setChecking(false);
    else start(token).finally(() => setChecking(false));
  }, [start]);

  const loadPosts = useCallback(async (token: string) => {
    setPosts(null);
    try {
      const all = await Promise.all(
        (["sr", "en"] as Locale[]).map(async (lang) =>
          (await listMarkdown(token, `content/posts/${lang}`)).map((file) => ({
            post: parsePost(lang, file.path.split("/").pop()!.replace(/\.md$/, ""), file.text),
            sha: file.sha,
          })),
        ),
      );
      setPosts(all.flat());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Postovi nisu mogli da se učitaju.");
      setPosts([]);
    }
  }, []);

  useEffect(() => {
    // Lista se (ponovo) učitava posle prijave i posle izlaska iz editora.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (session && !editing) loadPosts(session.token);
  }, [session, editing, loadPosts]);

  async function onLogin() {
    setError("");
    try {
      await start(await login());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prijava nije uspela.");
    }
  }

  if (editing && session) {
    return (
      <Editor
        key={`${editing.post.lang}/${editing.post.slug}/${editing.sha}`}
        target={editing}
        token={session.token}
        readOnly={session.readOnly}
        posts={posts ?? []}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-blanco">
      <header className="border-b border-linija">
        <div className="mx-auto flex max-w-300 items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo lang="sr" />
            <span className="eyebrow border-l border-linija pl-4">Studio</span>
          </div>
          {session && (
            <div className="flex items-center gap-4 text-sm">
              <span className="hidden text-negro/70 sm:inline">{session.user?.name ?? "Samo pregled"}</span>
              <button
                type="button"
                className="link"
                onClick={() => {
                  forgetToken();
                  setSession(null);
                  setPosts(null);
                }}
              >
                Odjavi se
              </button>
            </div>
          )}
        </div>
      </header>

      {!publishesToSite && (
        <p className="bg-mostaza/30 px-6 py-2 text-center text-sm text-negro">
          Probni režim: izmene idu u granu „{site.studio.branch}“ i ne pojavljuju se na sajtu.
        </p>
      )}

      {session ? (
        <PostList
          posts={posts}
          readOnly={session.readOnly}
          onOpen={(target) => setEditing(target)}
          error={error}
        />
      ) : (
        <main className="mx-auto flex max-w-140 flex-col items-center px-6 py-18 text-center md:py-30">
          <p className="font-script text-5xl text-naranja">Hola,</p>
          <h1 className="mt-2 text-negro">dobro došla u Studio</h1>
          <p className="mt-4 text-negro/75">
            Ovde pišeš nove tekstove i menjaš postojeće — tačno onako kako će izgledati na sajtu.
          </p>
          {checking ? (
            <p className="mt-8 text-sm text-negro/60">Proveravam prijavu…</p>
          ) : site.studio.authUrl ? (
            <button type="button" className="btn mt-8" onClick={onLogin}>
              Prijavi se preko GitHub-a
            </button>
          ) : (
            <p className="mt-8 border border-linija px-5 py-4 text-sm text-negro/75">
              Prijava još nije podešena (<code>site.studio.authUrl</code>, vidi <code>docs/studio.md</code>).
            </p>
          )}
          {process.env.NODE_ENV === "development" && !checking && (
            <button
              type="button"
              className="mt-4 text-sm link"
              onClick={() => setSession({ token: "", user: null, readOnly: true })}
            >
              Probaj bez prijave (samo pregled)
            </button>
          )}
          {error && <p className="mt-6 text-sm text-rojo">{error}</p>}
        </main>
      )}
    </div>
  );
}
