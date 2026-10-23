import Link from "next/link";
import type { Locale } from "@/i18n/config";

export default function Logo({ lang, light = false }: { lang: Locale; light?: boolean }) {
  return (
    <Link href={`/${lang}`} className="flex flex-col leading-none" aria-label="VIDA — a la española">
      <span
        className={`font-serif text-2xl font-bold tracking-[0.12em] ${
          light ? "text-cloud" : "text-braon"
        }`}
      >
        VIDA
      </span>
      <span
        className={`mt-1 font-serif text-sm italic ${
          light ? "text-zlatna" : "text-terracotta"
        }`}
      >
        a la española
      </span>
    </Link>
  );
}
