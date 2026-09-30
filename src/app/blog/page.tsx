import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Vida Español",
  description: "Svi tekstovi o učenju španskog jezika.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-7xl px-8 pt-28 pb-16">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Blog
      </h1>
      <p className="mt-2 text-zinc-500">
        Saveti za učenje španskog, gramatika, vokabular i lična iskustva.
      </p>
      {posts.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-zinc-400">Nema objavljenih tekstova.</p>
      )}
    </main>
  );
}
