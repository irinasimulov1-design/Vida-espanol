import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";
import type { PostWithContent } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";
import { href, postHref } from "@/lib/routes";

// Strukturisani podaci (schema.org) — po njima Google i AI asistenti razumeju
// ko piše sajt, o čemu je tekst i na kom je jeziku.

const personId = `${site.url}/#irina`;
const websiteId = `${site.url}/#website`;

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // < se escape-uje da sadržaj ne bi mogao da zatvori <script> tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function SiteJsonLd({ lang, t }: { lang: Locale; t: Dictionary }) {
  const sameAs = Object.values(site.social).filter(Boolean);
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": websiteId,
            url: site.url,
            name: site.name,
            description: t.meta.siteDescription,
            inLanguage: ["sr", "en"],
            publisher: { "@id": personId },
          },
          {
            "@type": "Person",
            "@id": personId,
            name: site.author.name,
            url: absoluteUrl(href("about", lang)),
            image: absoluteUrl(site.author.image),
            jobTitle: lang === "sr" ? "Profesorka španskog jezika" : "Spanish teacher",
            description: t.author.bio,
            knowsLanguage: ["es", "sr", "en"],
            knowsAbout: ["Spanish language", "Spanish grammar", "Language learning", "Spanish culture"],
            sameAs,
          },
        ],
      }}
    />
  );
}

export function PostJsonLd({
  post,
  t,
}: {
  post: PostWithContent;
  t: Dictionary;
}) {
  const url = absoluteUrl(postHref(post.lang, post.slug));
  const otherLang = post.lang === "sr" ? "en" : "sr";

  const graph: object[] = [
    {
      "@type": "BlogPosting",
      "@id": `${url}#post`,
      mainEntityOfPage: url,
      url,
      headline: post.title,
      description: post.excerpt,
      ...(post.ukratko && { abstract: post.ukratko }),
      inLanguage: post.lang,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      ...(post.coverImage && { image: absoluteUrl(post.coverImage) }),
      keywords: post.categories.join(", "),
      author: { "@id": personId },
      publisher: { "@id": personId },
      isPartOf: { "@id": websiteId },
      ...(post.prevod && {
        workTranslation: { "@id": `${absoluteUrl(postHref(otherLang, post.prevod))}#post` },
      }),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t.post.breadcrumbHome, item: absoluteUrl(href("home", post.lang)) },
        { "@type": "ListItem", position: 2, name: t.nav.blog, item: absoluteUrl(href("blog", post.lang)) },
        { "@type": "ListItem", position: 3, name: post.title, item: url },
      ],
    },
  ];

  if (post.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      inLanguage: post.lang,
      mainEntity: post.faq.map((item) => ({
        "@type": "Question",
        name: item.pitanje,
        acceptedAnswer: { "@type": "Answer", text: item.odgovor },
      })),
    });
  }

  return <JsonLdScript data={{ "@context": "https://schema.org", "@graph": graph }} />;
}
