"use client";

import { site } from "@/lib/site";
import { postHref } from "@/lib/routes";
import type { StudioPost } from "@/lib/studio/markdown";

/** Koliko rečenica ima tekst (grubo, dovoljno za savet „2–3 rečenice“). */
function sentences(text: string): number {
  return text.split(/[.!?…]+(\s|$)/).filter((s) => s.trim().length > 2).length;
}

function Counter({ label, value, ideal }: { label: string; value: number; ideal: [number, number] }) {
  const ok = value >= ideal[0] && value <= ideal[1];
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-negro/70">{label}</span>
      <span className={ok ? "text-verde" : value === 0 ? "text-negro/40" : "text-naranja"}>
        {value} <span className="text-negro/40">/ {ideal[0]}–{ideal[1]}</span>
      </span>
    </div>
  );
}

export interface SeoCheck {
  ok: boolean;
  text: string;
}

export function seoChecks(post: StudioPost, hasPair: boolean): SeoCheck[] {
  const images = [...post.body.matchAll(/!\[([^\]]*)\]\(/g)];
  return [
    { ok: post.title.trim().length >= 20 && post.title.length <= 65, text: "Naslov 20–65 znakova (pitanje ili jasno obećanje)" },
    { ok: post.excerpt.length >= 70 && post.excerpt.length <= 155, text: "Opis za Google 70–155 znakova" },
    { ok: !!post.coverImage, text: "Naslovna fotografija" },
    { ok: sentences(post.ukratko) >= 2 && sentences(post.ukratko) <= 3, text: "„Ukratko“ u 2–3 rečenice (AI ovo najčešće citira)" },
    { ok: /^## /m.test(post.body), text: "Bar jedan podnaslov (H2)" },
    { ok: post.faq.filter((f) => f.pitanje.trim() && f.odgovor.trim()).length >= 2, text: "Bar 2 česta pitanja" },
    { ok: images.every((m) => m[1].trim().length > 0), text: "Svaka fotografija u tekstu ima opis" },
    { ok: post.categories.length > 0, text: "Bar jedna kategorija" },
    { ok: hasPair, text: `Postoji ${post.lang === "sr" ? "engleska" : "srpska"} verzija` },
  ];
}

/** Pomoćnik: brojači, pregled u Google-u i lista provera. Savetuje, ne blokira objavu. */
export default function SeoPanel({ post, hasPair }: { post: StudioPost; hasPair: boolean }) {
  const checks = seoChecks(post, hasPair);
  const done = checks.filter((c) => c.ok).length;
  const host = new URL(site.url).host;
  const title = `${post.title || "Naslov teksta"} — ${site.name}`;

  return (
    <section aria-label="SEO i GEO pomoćnik">
      <p className="eyebrow">Google i AI · {done}/{checks.length}</p>

      <div className="mt-4 border border-linija bg-papel p-4">
        <p className="truncate text-xs text-negro/60">
          {host} › {postHref(post.lang, post.slug || "…").split("/").filter(Boolean).join(" › ")}
        </p>
        <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-negro/75">
          {post.excerpt || "Ovde će stajati opis za Google — jedna rečenica koja poziva na klik."}
        </p>
      </div>

      <div className="mt-4 space-y-1.5">
        <Counter label="Naslov (znakova)" value={post.title.trim().length} ideal={[20, 65]} />
        <Counter label="Opis (znakova)" value={post.excerpt.length} ideal={[70, 155]} />
        <Counter label="Ukratko (rečenica)" value={sentences(post.ukratko)} ideal={[2, 3]} />
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {checks.map((check) => (
          <li key={check.text} className="flex gap-2">
            <span className={check.ok ? "text-verde" : "text-naranja"} aria-hidden="true">
              {check.ok ? "✓" : "○"}
            </span>
            <span className={check.ok ? "text-negro/60" : "text-negro"}>{check.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
