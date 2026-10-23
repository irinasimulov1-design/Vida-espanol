"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import { readConsent, saveConsent, subscribeConsent, subscribeOpenBanner } from "@/lib/consent";

export default function CookieConsent({
  t,
  privacyHref,
}: {
  t: Dictionary["cookies"];
  privacyHref: string;
}) {
  // "pending" na serveru i pre hidratacije, da se baner ne bi bljesnuo onima koji su već izabrali.
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => "pending" as const);
  const [reopened, setReopened] = useState(false);

  useEffect(() => subscribeOpenBanner(() => setReopened(true)), []);

  if (consent === "pending" || (consent && !reopened)) return null;

  const choose = (value: "granted" | "denied") => {
    saveConsent(value);
    setReopened(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookies"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:p-0"
    >
      <div className="rounded-2xl border border-bez bg-cloud p-5 shadow-lg">
        <p className="text-sm leading-relaxed text-braon">
          {t.text}{" "}
          <Link href={privacyHref} className="text-terracotta underline-offset-4 hover:underline">
            {t.more}
          </Link>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-full bg-bordo px-5 py-2 text-sm font-semibold text-cloud transition hover:brightness-110"
          >
            {t.accept}
          </button>
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-full border border-braon/25 px-5 py-2 text-sm font-semibold text-braon transition-colors hover:bg-bez"
          >
            {t.essential}
          </button>
        </div>
      </div>
    </div>
  );
}
