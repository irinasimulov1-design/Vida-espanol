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
        {/* Pozadina: prozori iz Andaluzije, utišani ka paleti (manje zasićeno, topliji ton) */}
        <Image
          src="/hero-andaluzija-prozori.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover [filter:saturate(0.55)_sepia(0.18)_brightness(0.92)_contrast(0.95)]"
        />

        {/* Overlay da beli tekst bude čitljiv */}
        <div className="absolute inset-0 bg-negro/55" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 inset-shadow-sekcija" />

        <div className="relative z-10 mx-auto w-full max-w-300 px-4 py-24 md:px-8">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
            {/* Left content */}
            <div className="max-w-xl">
              <p className="eyebrow text-oro text-shadow-dubina-sm">{t.hero.motto}</p>

              <h1 className="mt-4 text-blanco text-shadow-dubina">
                {t.hero.titleLine1}
                <br />
                {t.hero.titleLine2}
              </h1>

              <p className="mt-6 text-blanco/85 text-shadow-dubina-sm">{t.hero.text}</p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href={href("blog", lang)}
                  className="btn"
                >
                  {t.hero.ctaBlog}
                </Link>
                <Link
                  href="#zakazi-cas"
                  className="btn btn-ghost btn-ghost-light"
                >
                  {t.hero.ctaBook}
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm text-blanco/80 text-shadow-dubina-sm">
                {t.hero.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-oro" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Teacher image with decorative shapes */}
            <div className="relative hidden lg:block">
              <div className="absolute -top-16 -right-16 h-80 w-80 rounded-full bg-naranja/40" />
              <div className="absolute -bottom-12 -left-12 h-60 w-60 rounded-full bg-oro/30" />

              <div className="relative z-10">
                <Image
                  src="/pexels-mikhail-nilov-6981004.jpg"
                  alt={t.hero.imageAlt}
                  width={480}
                  height={600}
                  className="photo h-135 w-105 object-top shadow-fotka"
                  priority
                />

                <div className="absolute bottom-6 left-6 bg-papel px-5 py-3 shadow-papel">
                  <p className="font-display text-lg font-medium italic text-negro">Irina Stojanović</p>
                  <p className="text-xs text-negro/70">{t.hero.nameCardRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest posts */}
      <section className="py-18 md:py-30">
        <div className="mx-auto max-w-300 px-4 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{t.home.blogEyebrow}</p>
              <h2 className="mt-1 text-negro">
                {t.home.blogTitle}
              </h2>
              <p className="mt-2 text-negro/70">{t.home.blogText}</p>
            </div>
            <Link
              href={href("blog", lang)}
              className="text-sm link"
            >
              {t.home.allPosts}
            </Link>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          {posts.length === 0 && <p className="mt-10 text-negro/60">{t.home.empty}</p>}
        </div>
      </section>

      <Booking t={t.booking} />
    </>
  );
}
