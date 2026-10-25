"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

/** Mobilna navigacija: crni blok „Meni“ otvara jednostavan papirni panel sa linkovima. */
export default function MobileMenu({
  lang,
  t,
  links,
}: {
  lang: Locale;
  t: Dictionary["nav"];
  links: { label: string; href: string }[];
}) {
  // Meni pamti stranicu na kojoj je otvoren, pa se posle navigacije sam zatvori.
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const panelId = useId();

  // Zatvori na Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        className="nav-blok"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {t.menu}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute left-0 top-full mt-1.5 w-64 border border-linija bg-papel p-6 shadow-papel"
        >
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="eyebrow text-negro! transition-colors hover:text-tinto!">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-linija pt-5">
            <LanguageSwitcher lang={lang} label={t.language} />
          </div>
        </div>
      )}
    </div>
  );
}
