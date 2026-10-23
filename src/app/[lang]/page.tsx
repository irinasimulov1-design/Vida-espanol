import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Booking from "@/components/Booking";
import { getDictionary } from "@/i18n";
import { hasLocale, locales, type Locale } from "@/i18n/config";
import { href, pageAlternates } from "@/lib/routes";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(props: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await props.params;
  if (!hasLocale(lang)) return {};
  return { alternates: pageAlternates("home", lang) };
}

export default async function Home(props: PageProps<"/[lang]">) {
  const lang = (await props.params).lang as Locale;
  const t = getDictionary(lang);
  const posts = getAllPosts(lang).slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100svh-4.5rem)] items-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/14388911-uhd_3840_2160_60fps.mp4" type="video/mp4" />
        </video>

        {/* Warm overlay */}
        <div className="absolute inset-0 bg-braon/60" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 md:px-8">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
            {/* Left content */}
            <div className="max-w-xl">
              <p className="font-serif text-xl italic text-zlatna">{t.hero.motto}</p>

              <h1 className="mt-4 text-4xl font-semibold leading-tight text-cloud sm:text-5xl lg:text-6xl">
                {t.hero.titleLine1}
                <br />
                {t.hero.titleLine2}
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-cloud/85">{t.hero.text}</p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={href("blog", lang)}
                  className="rounded-full bg-bordo px-7 py-3 text-sm font-semibold text-cloud transition hover:brightness-110"
                >
                  {t.hero.ctaBlog}
                </Link>
                <Link
                  href="#zakazi-cas"
                  className="rounded-full border border-cloud/40 px-7 py-3 text-sm font-semibold text-cloud transition-colors hover:bg-cloud/10"
                >
                  {t.hero.ctaBook}
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-cloud/80">
                {t.hero.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-zlatna" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Teacher image with decorative shapes */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-16 -right-16 h-80 w-80 rounded-full bg-terracotta/40 blur-sm" />
              <div className="absolute -bottom-12 -left-12 h-60 w-60 rounded-full bg-zlatna/30 blur-sm" />

              <div className="relative z-10">
                <Image
                  src="/pexels-mikhail-nilov-6981004.jpg"
                  alt={t.hero.imageAlt}
                  width={480}
                  height={600}
                  className="h-135 w-105 rounded-3xl object-cover object-top shadow-2xl"
                  priority
                />

                <div className="absolute bottom-6 left-6 rounded-xl bg-cloud/95 px-5 py-3 shadow-lg backdrop-blur-sm">
                  <p className="font-serif text-base font-semibold text-braon">Irina Stojanović</p>
                  <p className="text-xs text-braon/70">{t.hero.nameCardRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-serif text-lg italic text-terracotta">{t.home.blogEyebrow}</p>
              <h2 className="mt-1 text-3xl font-semibold text-braon md:text-4xl">
                {t.home.blogTitle}
              </h2>
              <p className="mt-2 text-braon/70">{t.home.blogText}</p>
            </div>
            <Link
              href={href("blog", lang)}
              className="text-sm font-semibold text-terracotta hover:underline"
            >
              {t.home.allPosts}
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {posts.length === 0 && <p className="mt-10 text-braon/60">{t.home.empty}</p>}
        </div>
      </section>

      <Booking t={t.booking} />
    </>
  );
}
