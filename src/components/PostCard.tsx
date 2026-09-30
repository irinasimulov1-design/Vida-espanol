import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sr-Latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <article className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-shadow hover:shadow-md">
        {post.coverImage && (
          <div className="relative h-52 w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {post.categories.length > 0 ? (
              post.categories.map((cat, i) => (
                <span
                  key={cat}
                  className={`rounded-full px-2.5 py-0.5 font-semibold uppercase tracking-wider ${
                    [
                      "bg-teal-50 text-teal-600",
                      "bg-amber-50 text-amber-600",
                      "bg-rose-50 text-rose-600",
                    ][i % 3]
                  }`}
                >
                  {cat}
                </span>
              ))
            ) : (
              <span className="font-semibold uppercase tracking-wider text-teal-600">
                Blog
              </span>
            )}
            <time className="text-zinc-400">{formatDate(post.date)}</time>
          </div>
          <h3 className="mt-3 text-lg font-bold leading-snug text-zinc-900 group-hover:text-teal-700 transition-colors">
            {post.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500 line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}
