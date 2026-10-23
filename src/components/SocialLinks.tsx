"use client";

import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { track } from "@/lib/track";

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Neutralan znak (oblačić sa „P“), ne Preply-jev zaštićeni logotip.
function PreplyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 5.94 2 10.8c0 2.62 1.3 4.97 3.37 6.58L4.5 22l4.62-2.6c.92.2 1.88.3 2.88.3 5.523 0 10-3.94 10-8.9S17.523 2 12 2zm-2.1 4.7h3.05c2.02 0 3.35 1.18 3.35 2.98 0 1.83-1.36 3.02-3.4 3.02h-1.2v2.9H9.9V6.7zm1.8 1.55v2.9h1.07c.96 0 1.55-.55 1.55-1.46 0-.9-.58-1.44-1.53-1.44H11.7z" />
    </svg>
  );
}

type Profile = keyof typeof site.social;

const profiles: { key: Profile; icon: ReactNode }[] = [
  { key: "instagram", icon: <InstagramIcon /> },
  { key: "youtube", icon: <YouTubeIcon /> },
  { key: "linkedin", icon: <LinkedInIcon /> },
  { key: "preply", icon: <PreplyIcon /> },
];

/** Linkovi ka profilima; profil bez URL-a u site.ts je neaktivna ikonica („uskoro“). */
export default function SocialLinks({
  labels,
  variant = "dark",
}: {
  labels: Record<Profile | "soon", string>;
  variant?: "dark" | "light";
}) {
  const style =
    variant === "dark"
      ? "bg-blanco/10 text-blanco/80 hover:bg-oro hover:text-negro"
      : "bg-hormigon text-negro hover:bg-negro hover:text-blanco";
  const placeholderStyle = variant === "dark" ? "bg-blanco/10 text-blanco" : "bg-hormigon text-negro";

  return (
    <div className="flex gap-3">
      {profiles.map(({ key, icon }) =>
        site.social[key] ? (
          <a
            key={key}
            href={site.social[key]}
            target="_blank"
            rel="me noopener noreferrer"
            aria-label={labels[key]}
            title={labels[key]}
            onClick={() => track("klik_profil", { profil: key })}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${style}`}
          >
            {icon}
          </a>
        ) : (
          <span
            key={key}
            role="img"
            aria-label={`${labels[key]} (${labels.soon})`}
            title={`${labels[key]} (${labels.soon})`}
            className={`flex h-10 w-10 cursor-default items-center justify-center rounded-full opacity-40 ${placeholderStyle}`}
          >
            {icon}
          </span>
        ),
      )}
    </div>
  );
}
