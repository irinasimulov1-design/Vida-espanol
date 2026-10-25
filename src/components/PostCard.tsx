import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/posts";
import { getDictionary } from "@/i18n";
import { formatDate } from "@/i18n/config";
import { postHref } from "@/lib/routes";

/** Kartica posta: fotka je monohromatska, a na hover dobija boju i zlatnu oznaku „Pročitaj“. */
export default function PostCard({ post }: { post: Post }) {
  const t = getDictionary(post.lang);

  return (
    <Link href={postHref(post.lang, post.slug)} className="group block">
      <article>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-blanco">
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="photo-mono group-hover:scale-[1.03]"
            />
          )}
          <span className="eyebrow absolute bottom-0 left-0 translate-y-full bg-oro px-4 py-2.5 text-[11px]! text-negro! opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            {t.blog.read}
          </span>
        </div>

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <h3 className="transition-colors duration-300 group-hover:text-tinto">{post.title}</h3>
          <time dateTime={post.date} className="eyebrow shrink-0 text-[10px]!">
            {formatDate(post.date, post.lang)}
          </time>
        </div>
        {post.categories.length > 0 && (
          <p className="eyebrow mt-2 text-[10px]!">{post.categories.join(" · ")}</p>
        )}
        <p className="mt-3 line-clamp-2 text-sm">{post.excerpt}</p>
      </article>
    </Link>
  );
}
