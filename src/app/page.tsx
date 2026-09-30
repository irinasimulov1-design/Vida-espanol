import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/14388911-uhd_3840_2160_60fps.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-8 py-32">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
            {/* Left content */}
            <div className="max-w-xl">
              <span className="inline-block rounded-full bg-teal-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                Online škola španskog jezika
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                Nauči španski koji ćeš stvarno koristiti
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-white/80">
                Razvila sam metodu uz pomoć koje je već više hiljada ljudi
                progovorilo španski. Vokabular, komunikacija i motivacija
                — tri stvari koje zaista prave razliku.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/blog"
                  className="rounded-full bg-rose-500 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
                >
                  Pogledaj blog
                </Link>
                <Link
                  href="/o-meni"
                  className="rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Više o meni
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-12 flex gap-8 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400" />
                  100+ lekcija
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400" />
                  Praktični saveti
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-400" />
                  Lična iskustva
                </div>
              </div>
            </div>

            {/* Right — Teacher image with decorative shapes */}
            <div className="relative hidden lg:block">
              {/* Decorative blobs */}
              <div className="absolute -top-16 -right-16 h-80 w-80 rounded-full bg-teal-400/30 blur-sm" />
              <div className="absolute -bottom-12 -left-12 h-60 w-60 rounded-full bg-rose-400/30 blur-sm" />
              <div className="absolute top-1/2 -right-8 h-40 w-40 rounded-full bg-amber-400/20 blur-sm" />

              {/* Teacher image */}
              <div className="relative z-10">
                <Image
                  src="/pexels-mikhail-nilov-6981004.jpg"
                  alt="Učiteljica španskog jezika"
                  width={480}
                  height={600}
                  className="h-135 w-105 rounded-3xl object-cover object-top shadow-2xl"
                  priority
                />

                {/* Name card overlay */}
                <div className="absolute bottom-6 left-6 rounded-xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-bold text-zinc-900">
                    Irina Stojanović
                  </p>
                  <p className="text-xs text-zinc-500">
                    Blog o učenju španskog
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="text-3xl font-bold text-zinc-900">Blog</h2>
          <p className="mt-2 text-zinc-500">
            Saveti za učenje španskog, gramatika, vokabular i lična iskustva.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {posts.length === 0 && (
            <p className="mt-10 text-zinc-400">
              Uskoro dolaze novi tekstovi.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
