import { getDictionary } from "@/i18n";
import { locales, type Locale } from "@/i18n/config";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { href, postHref } from "@/lib/routes";
import { absoluteUrl, site } from "@/lib/site";

// llms.txt (https://llmstxt.org): sajt opisan u markdownu, da ga AI asistenti čitaju bez HTML-a.

const sectionTitle: Record<Locale, string> = {
  sr: "Blog na srpskom",
  en: "Blog in English",
};

function header(): string {
  const en = getDictionary("en");
  const social = Object.entries(site.social)
    .filter(([, url]) => url)
    .map(([name, url]) => `- ${name}: ${url}`)
    .join("\n");

  return [
    `# ${site.name}`,
    "",
    `> ${en.meta.siteDescription}`,
    "",
    `Blog about learning Spanish by ${site.author.name}, a Spanish teacher. Every article exists in Serbian (/sr) and, where translated, in English (/en).`,
    `Lessons with Irina can be booked at ${absoluteUrl(href("home", "en"))}#zakazi-cas.`,
    "",
    "## Author",
    "",
    `- About (EN): ${absoluteUrl(href("about", "en"))}`,
    `- O meni (SR): ${absoluteUrl(href("about", "sr"))}`,
    social,
  ].join("\n");
}

export function buildLlmsTxt(): string {
  const sections = locales.map((lang) => {
    const posts = getAllPosts(lang).map(
      (post) => `- [${post.title}](${absoluteUrl(postHref(lang, post.slug))}): ${post.ukratko || post.excerpt}`
    );
    return [`## ${sectionTitle[lang]}`, "", ...posts].join("\n");
  });

  return [header(), ...sections, `## Optional\n\n- [Full text of all articles](${absoluteUrl("/llms-full.txt")})`].join(
    "\n\n"
  ) + "\n";
}

export async function buildLlmsFullTxt(): Promise<string> {
  const sections = await Promise.all(
    locales.map(async (lang) => {
      const posts = await Promise.all(
        getAllPosts(lang).map(async ({ slug }) => {
          const post = await getPostBySlug(lang, slug);
          const faq = post.faq.map((item) => `**${item.pitanje}**\n\n${item.odgovor}`).join("\n\n");
          return [
            `### ${post.title}`,
            "",
            `URL: ${absoluteUrl(postHref(lang, slug))}`,
            `Author: ${site.author.name} · Published: ${post.date}${post.updated ? ` · Updated: ${post.updated}` : ""}`,
            "",
            post.ukratko ? `> ${post.ukratko}\n` : "",
            post.markdown,
            faq ? `\n#### FAQ\n\n${faq}` : "",
          ].join("\n");
        })
      );
      return [`## ${sectionTitle[lang]}`, ...posts].join("\n\n");
    })
  );

  return [header(), ...sections].join("\n\n") + "\n";
}
