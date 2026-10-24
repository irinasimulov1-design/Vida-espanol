import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Booking from "@/components/Booking";
import NewsletterSignup from "@/components/NewsletterSignup";
import Naranja from "@/components/Naranja";
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
      {/* Prvi ekran: samo VIDA i „a la española“, najmanje 70% praznog prostora */}
      <section className="flex min-h-[calc(100svh-3.75rem)] flex-col items-center justify-between px-5 pt-16 pb-10">
        <div aria-hidden="true" />
        <div className="text-center">
          <p className="font-display text-[clamp(4.5rem,20vw,12.5rem)] font-normal leading-none tracking-[0.14em] text-negro [margin-right:-0.14em]">
            VIDA
          </p>
          <p className="eyebrow mt-6 md:mt-8">a la española</p>
        </div>
        <a href="#el-idioma" aria-label={t.hero.scroll} className="group flex flex-col items-center gap-3">
          <Naranja className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-12" />
          <span className="block h-12 w-px bg-negro/50 transition-all duration-300 group-hover:h-14 group-hover:bg-tinto" />
        </a>
      </section>

      {/* Filozofija */}
      <section id="el-idioma" className="scroll-mt-6 border-t border-linija px-5 py-22 text-center md:py-40">
        <p className="eyebrow">{t.hero.motto}</p>
        <h1 className="mx-auto mt-6 max-w-3xl">
          {t.hero.titleLine1}
          <br />
          <em>{t.hero.titleLine2}</em>
        </h1>
        <p className="mx-auto mt-8 max-w-140">{t.hero.text}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          <Link href={href("blog", lang)} className="btn">
            {t.hero.ctaBlog}
          </Link>
          <Link href="#zakazi-cas" className="btn-link">
            {t.hero.ctaBook}
          </Link>
        </div>
        <p className="eyebrow mt-14 text-[11px]!">{t.hero.highlights.join(" · ")}</p>
      </section>

      {/* Najnoviji tekstovi */}
      <section className="mx-auto w-full max-w-300 px-5 pb-22 md:px-8 md:pb-40">
        <div className="flex items-baseline justify-between gap-4 border-t border-negro pt-5">
          <p className="eyebrow text-negro!">{t.home.blogEyebrow}</p>
          <Link href={href("blog", lang)} className="eyebrow transition-colors duration-300 hover:text-tinto!">
            {t.home.allPosts}
          </Link>
        </div>
        <h2 className="mt-10 max-w-xl">{t.home.blogTitle}</h2>
        <p className="mt-4 max-w-140">{t.home.blogText}</p>
        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        {posts.length === 0 && <p className="mt-10 text-gris">{t.home.empty}</p>}
      </section>

      <NewsletterSignup lang={lang} t={t.newsletter} postcard />

      <Booking t={t.booking} />
    </>
  );
}
