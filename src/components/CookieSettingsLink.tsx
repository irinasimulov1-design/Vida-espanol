"use client";

import { openConsentBanner } from "@/lib/consent";

export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button type="button" onClick={openConsentBanner} className="nav-link [--akcenat:var(--color-oro)]">
      {label}
    </button>
  );
}
