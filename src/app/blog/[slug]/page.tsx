import Image from "next/image";
import Link from "next/link";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { notFound } from "next/navigation";
import ShareButtons from "@/components/ShareButtons";

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
    <main className="pb-16">
      {post.coverImage && (
        <section className="relative h-[66vh] w-full">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center max-w-3xl">
              {post.title}
            </h1>
            {post.categories.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {post.categories.map((cat, i) => (
                  <span
                    key={cat}
                    className={`rounded-full px-4 py-1 text-sm font-medium text-white backdrop-blur-sm ${
                      [
                        "bg-teal-500/40",
                        "bg-amber-500/40",
                        "bg-rose-500/40",
                      ][i % 3]
                    }`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
      <article className="mx-auto max-w-3xl px-6 pt-10">
        {!post.coverImage && (
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {post.title}
          </h1>
        )}
        <time className="mt-3 block text-sm text-zinc-400">
          {formatDate(post.date)}
        </time>
        <div
          className="prose mt-10"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
      <div className="mx-auto max-w-3xl px-6 mt-16 pt-8 border-t border-zinc-100 flex flex-col items-center gap-6">
        <ShareButtons title={post.title} />
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
