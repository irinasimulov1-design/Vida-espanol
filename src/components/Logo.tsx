import Link from "next/link";
import type { Locale } from "@/i18n/config";

/** Tipografski logo: VIDA (Cormorant) i ispod sitno „a la española“. */
export default function Logo({ lang, light = false }: { lang: Locale; light?: boolean }) {
  return (
    <Link href={`/${lang}`} className="inline-flex flex-col items-start leading-none" aria-label="VIDA — a la española">
      <span className={`font-display text-3xl font-normal tracking-[0.14em] ${light ? "text-fondo" : "text-negro"}`}>
        VIDA
      </span>
      <span className={`eyebrow mt-2 text-[10px]! ${light ? "text-fondo/60!" : ""}`}>a la española</span>
    </Link>
  );
}
