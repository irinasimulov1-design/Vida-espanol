"use client";

import { openConsentBanner } from "@/lib/consent";

export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" onClick={openConsentBanner} className="transition-colors hover:text-zlatna">
      {label}
    </button>
  );
}
