import type { MetadataRoute } from "next";
import { locales, otherLocale } from "@/i18n/config";
import { getAllPosts } from "@/lib/posts";
import { href, postHref, type PageKey } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

// Svaka stranica nosi i svoj par na drugom jeziku (hreflang u sitemapi).
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: PageKey[] = ["home", "blog", "about", "privacy"];

  const pageEntries = pages.flatMap((page) =>
    locales.map((lang) => ({
      url: absoluteUrl(href(page, lang)),
      changeFrequency: page === "blog" ? ("weekly" as const) : ("monthly" as const),
      priority: page === "home" ? 1 : page === "blog" ? 0.9 : 0.5,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(href(page, l))])),
      },
    }))
  );

  const postEntries = locales.flatMap((lang) =>
    getAllPosts(lang).map((post) => ({
      url: absoluteUrl(postHref(lang, post.slug)),
      lastModified: post.updated || post.date,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      ...(post.prevod && {
        alternates: {
          languages: {
            [lang]: absoluteUrl(postHref(lang, post.slug)),
            [otherLocale(lang)]: absoluteUrl(postHref(otherLocale(lang), post.prevod)),
          },
        },
      }),
    }))
  );

  return [{ url: absoluteUrl("/"), priority: 1 }, ...pageEntries, ...postEntries];
}
