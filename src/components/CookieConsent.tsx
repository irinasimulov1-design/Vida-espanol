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
      <div className="border border-linija bg-papel p-5 shadow-papel">
        <p className="text-sm leading-relaxed text-negro">
          {t.text}{" "}
          <Link href={privacyHref} className="link">
            {t.more}
          </Link>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("granted")}
            className="btn"
          >
            {t.accept}
          </button>
          <button
            type="button"
            onClick={() => choose("denied")}
            className="btn btn-ghost"
          >
            {t.essential}
          </button>
        </div>
      </div>
    </div>
  );
}
