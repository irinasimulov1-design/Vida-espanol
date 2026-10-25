// GitHub REST API za Studio: čitanje postova i commit više fajlova odjednom (Git Data API).
// Token dolazi od GitHub App prijave (Worker studio-auth) i živi samo u sessionStorage.
import { site } from "@/lib/site";

const API = "https://api.github.com";
const { repo, branch, baseBranch } = site.studio;

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function gh<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      // Bez tokena (samo pregled u razvoju) radi čitanje javnog repoa, uz nizak limit poziva.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new GitHubError(body.message ?? res.statusText, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

function decodeBase64(b64: string): string {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, "")), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export interface StudioUser {
  login: string;
  name: string;
  avatar: string;
}

/** Ko je prijavljen i da li sme da piše u repo. */
export async function getUser(token: string): Promise<StudioUser & { canWrite: boolean }> {
  const [user, repoInfo] = await Promise.all([
    gh<{ login: string; name: string | null; avatar_url: string }>(token, "/user"),
    gh<{ permissions?: { push?: boolean } }>(token, `/repos/${repo}`),
  ]);
  return {
    login: user.login,
    name: user.name ?? user.login,
    avatar: user.avatar_url,
    canWrite: repoInfo.permissions?.push === true,
  };
}

/**
 * Odakle se čita: Studio grana ako postoji, inače baseBranch (probna grana nastaje tek pri
 * prvom čuvanju, od baseBranch). Pamti se da bi pregled slika (rawUrl) gledao u istu granu.
 */
let readRef: string = branch;

async function resolveReadRef(token: string): Promise<string> {
  try {
    await gh(token, `/repos/${repo}/git/ref/heads/${branch}`);
    readRef = branch;
  } catch (error) {
    if (!(error instanceof GitHubError) || error.status !== 404) throw error;
    readRef = baseBranch;
  }
  return readRef;
}

/** Vrh Studio grane; ako (probna) grana još ne postoji, pravi se od baseBranch. */
async function headSha(token: string): Promise<string> {
  try {
    const ref = await gh<{ object: { sha: string } }>(token, `/repos/${repo}/git/ref/heads/${branch}`);
    return ref.object.sha;
  } catch (error) {
    if (!(error instanceof GitHubError) || error.status !== 404) throw error;
    const base = await gh<{ object: { sha: string } }>(token, `/repos/${repo}/git/ref/heads/${baseBranch}`);
    await gh(token, `/repos/${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }),
    });
    readRef = branch;
    return base.object.sha;
  }
}

export interface RepoFile {
  path: string;
  sha: string;
  text: string;
}

/** Svi .md fajlovi iz foldera (bez šablona sa „_“), sa sadržajem i sha za proveru konflikta. */
export async function listMarkdown(token: string, dir: string): Promise<RepoFile[]> {
  await resolveReadRef(token);
  let entries: { name: string; path: string; type: string }[];
  try {
    entries = await gh(token, `/repos/${repo}/contents/${dir}?ref=${readRef}`);
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return [];
    throw error;
  }
  const files = entries.filter((e) => e.type === "file" && e.name.endsWith(".md") && !e.name.startsWith("_"));
  return Promise.all(files.map((file) => readFile(token, file.path) as Promise<RepoFile>));
}

export async function readFile(token: string, path: string): Promise<RepoFile | null> {
  try {
    const file = await gh<{ sha: string; content: string }>(
      token,
      `/repos/${repo}/contents/${encodeURI(path)}?ref=${readRef}`,
    );
    return { path, sha: file.sha, text: decodeBase64(file.content) };
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return null;
    throw error;
  }
}

export type CommitFile =
  | { path: string; text: string; expectedSha?: string | null }
  | { path: string; base64: string };

export class ConflictError extends Error {}

/**
 * Jedan commit sa svim fajlovima (post + slike). `expectedSha` štiti od prepisivanja tuđe
 * izmene: ako se fajl na grani promenio od kad je otvoren, commit se ne pravi.
 */
export async function commitFiles(token: string, files: CommitFile[], message: string): Promise<string> {
  for (const file of files) {
    if (!("text" in file) || file.expectedSha === undefined) continue;
    const current = await readFile(token, file.path);
    if ((current?.sha ?? null) !== file.expectedSha) {
      throw new ConflictError(`${file.path} je izmenjen u međuvremenu.`);
    }
  }

  const parentSha = await headSha(token);
  const parent = await gh<{ tree: { sha: string } }>(token, `/repos/${repo}/git/commits/${parentSha}`);

  const tree = await Promise.all(
    files.map(async (file) => {
      const blob = await gh<{ sha: string }>(token, `/repos/${repo}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({
          content: "text" in file ? encodeBase64(file.text) : file.base64,
          encoding: "base64",
        }),
      });
      return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );

  const newTree = await gh<{ sha: string }>(token, `/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string }>(token, `/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [parentSha] }),
  });
  await gh(token, `/repos/${repo}/git/refs/heads/${branch}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha;
}

/** Sha blob-a koji je git dodelio tekstu (isti algoritam kao `git hash-object`). */
export async function blobSha(text: string): Promise<string> {
  const body = new TextEncoder().encode(text);
  const header = new TextEncoder().encode(`blob ${body.length}\0`);
  const all = new Uint8Array(header.length + body.length);
  all.set(header);
  all.set(body, header.length);
  const digest = await crypto.subtle.digest("SHA-1", all);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type DeployState = "queued" | "running" | "done" | "failed" | "none";

/** Stanje objave za dati commit (workflow deploy.yml radi samo na master grani). */
export async function deployState(token: string, commitSha: string): Promise<DeployState> {
  const runs = await gh<{ workflow_runs: { status: string; conclusion: string | null }[] }>(
    token,
    `/repos/${repo}/actions/runs?head_sha=${commitSha}&per_page=5`,
  );
  const run = runs.workflow_runs[0];
  if (!run) return "queued";
  if (run.status !== "completed") return run.status === "in_progress" ? "running" : "queued";
  return run.conclusion === "success" ? "done" : "failed";
}

/** Adresa slika iz grane, za pregled pre nego što je deploy gotov (repo je javan). */
export function rawPrefix(): string {
  return `https://raw.githubusercontent.com/${repo}/${readRef}/public`;
}

export const publishesToSite = (branch as string) === "master";
