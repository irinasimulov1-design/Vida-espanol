import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import { formatDate } from "@/i18n/config";
import { postHref } from "@/lib/routes";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={postHref(post.lang, post.slug)} className="group">
      <article className="h-full overflow-hidden border border-linija bg-papel transition duration-300 group-hover:-translate-y-1 group-hover:border-negro group-hover:shadow-papel">
        {post.coverImage && (
          <div className="relative h-52 w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="photo transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {post.categories.length > 0 ? (
              post.categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-oro px-2.5 py-1 eyebrow text-negro"
                >
                  {cat}
                </span>
              ))
            ) : (
              <span className="bg-oro px-2.5 py-1 eyebrow text-negro">
                Blog
              </span>
            )}
            <time dateTime={post.date} className="text-negro/60">
              {formatDate(post.date, post.lang)}
            </time>
          </div>
          <h3 className="mt-3 text-negro decoration-naranja decoration-1 underline-offset-4 group-hover:underline">
            {post.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-negro/70 line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </article>
    </Link>
  );
}
