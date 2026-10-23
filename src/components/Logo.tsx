import Link from "next/link";
import type { Locale } from "@/i18n/config";

export default function Logo({ lang, light = false }: { lang: Locale; light?: boolean }) {
  return (
    <Link href={`/${lang}`} className="flex flex-col leading-none" aria-label="VIDA — a la española">
      <span
        className={`font-display text-2xl font-medium tracking-[0.12em] ${
          light ? "text-blanco" : "text-negro"
        }`}
      >
        VIDA
      </span>
      <span
        className={`mt-1 font-display text-sm italic ${
          light ? "text-oro" : "text-naranja"
        }`}
      >
        a la española
      </span>
    </Link>
  );
}
