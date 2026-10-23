import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/i18n/config";
import { postHref } from "@/lib/routes";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={postHref(post.lang, post.slug)} className="group">
      <article className="h-full overflow-hidden rounded-2xl bg-cloud shadow-sm ring-1 ring-bez transition-shadow hover:shadow-md">
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
              post.categories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-bez px-2.5 py-0.5 font-semibold uppercase tracking-wider text-terracotta"
                >
                  {cat}
                </span>
              ))
            ) : (
              <span className="font-semibold uppercase tracking-wider text-terracotta">
                Blog
              </span>
            )}
            <time dateTime={post.date} className="text-braon/60">
              {formatDate(post.date, post.lang)}
            </time>
          </div>
          <h3 className="mt-3 text-xl font-semibold leading-snug text-braon transition-colors group-hover:text-terracotta">
            {post.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-braon/70 line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}
