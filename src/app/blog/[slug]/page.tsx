import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  try {
    const post = await getPostBySlug(slug);
    return { title: `${post.title} — Vida Español`, description: post.excerpt };
  } catch {
    return { title: "Post nije pronađen — Vida Español" };
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sr-Latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPost(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-16">
      <article>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {post.title}
        </h1>
        <time className="mt-3 block text-sm text-zinc-400">
          {formatDate(post.date)}
        </time>
        <div
          className="prose mt-10"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
      <div className="mt-16 pt-8 border-t border-zinc-100">
        <Link
          href="/blog"
          className="text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          ← Nazad na blog
        </Link>
      </div>
    </main>
  );
}
