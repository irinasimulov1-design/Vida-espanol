import { getDictionary } from "@/i18n";
import { hasLocale, locales } from "@/i18n/config";
import { getAllPosts } from "@/lib/posts";
import { href, postHref } from "@/lib/routes";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(_request: Request, ctx: RouteContext<"/[lang]/rss.xml">) {
  const { lang } = await ctx.params;
  if (!hasLocale(lang)) return new Response("Not found", { status: 404 });
  const t = getDictionary(lang);

  const items = getAllPosts(lang)
    .map((post) => {
      const url = absoluteUrl(postHref(lang, post.slug));
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.ukratko || post.excerpt)}</description>
${post.categories.map((cat) => `      <category>${escapeXml(cat)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${absoluteUrl(href("blog", lang))}</link>
    <description>${escapeXml(t.meta.blogDescription)}</description>
    <language>${lang}</language>
    <atom:link href="${absoluteUrl(`/${lang}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
