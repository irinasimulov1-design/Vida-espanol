"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { track } from "@/lib/track";

// Prijava na pisma: Worker šalje mejl za potvrdu (double opt-in), a tek klik u tom mejlu
// upisuje adresu u Resend listu za jezik stranice. Posle potvrde Worker vraća ovde sa ?pisma=…
const endpoint = site.studio.authUrl ? `${site.studio.authUrl}/newsletter/subscribe` : "";

type Status = "idle" | "sending" | "sent" | "error" | "potvrdjeno" | "istekao" | "greska";

const inputClass =
  "w-full border-0 border-b border-negro/30 bg-transparent px-0 py-3 text-negro placeholder:text-negro/40 transition-colors focus:border-negro focus:outline-none";

export default function NewsletterSignup({
  lang,
  t,
  postcard = false,
}: {
  lang: Locale;
  t: Dictionary["newsletter"];
  postcard?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const result = new URLSearchParams(window.location.search).get("pisma");
    if (result === "potvrdjeno" || result === "istekao" || result === "greska") {
      // Stanje dolazi iz URL-a posle povratka sa linka za potvrdu.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(result);
      if (result === "potvrdjeno") track("newsletter_potvrda");
    }
  }, []);

  // Bez Workera (lokalni razvoj bez podešavanja) forma se ne prikazuje na pravom sajtu.
  if (!endpoint && process.env.NODE_ENV === "production") return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang, website }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      track("newsletter_prijava");
    } catch {
      setStatus("error");
    }
  }

  const message = {
    sent: t.sent,
    potvrdjeno: t.confirmed,
    istekao: t.expired,
    greska: t.error,
    error: t.error,
  } as const;

  const body = (
    <>
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 className={`mt-6 max-w-xl ${postcard ? "" : "mx-auto"}`}>{t.title}</h2>
      <p className={`mt-6 max-w-140 ${postcard ? "" : "mx-auto"}`}>{t.text}</p>

      {status === "sent" || status === "potvrdjeno" ? (
        <p role="status" className={`mt-10 max-w-140 font-display text-2xl italic ${postcard ? "text-negro" : "mx-auto"}`}>
          {message[status]}
        </p>
      ) : (
        <form
          onSubmit={onSubmit}
          className={`mt-10 flex max-w-md flex-col gap-6 sm:flex-row sm:items-end ${postcard ? "items-start" : "mx-auto items-center"}`}
        >
          <label className="w-full text-left">
            <span className="sr-only">{t.emailLabel}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailLabel}
              className={inputClass}
            />
          </label>
          {/* Skriveno polje: popunjavaju ga samo botovi */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
          />
          <button type="submit" className="btn shrink-0" disabled={status === "sending"}>
            {status === "sending" ? t.sending : t.button}
          </button>
        </form>
      )}

      {(status === "error" || status === "istekao" || status === "greska") && (
        <p role="alert" className="mt-6 text-sm text-rojo">
          {message[status]}
        </p>
      )}
      <p className={`mt-8 max-w-140 text-sm ${postcard ? "text-negro/60" : "mx-auto text-gris"}`}>{t.note}</p>
    </>
  );

  if (!postcard) {
    return (
      <section id="pisma" className="scroll-mt-6 border-t border-linija px-5 py-22 text-center md:py-32">
        {body}
      </section>
    );
  }

  // Početna: razglednica levo, tekst i forma desno. Na slici je razglednica već nagnuta ~-3°,
  // pa je hover ispravlja (rotate 3deg); ispod 480px hover ne rotira.
  return (
    <section id="pisma" className="scroll-mt-6 bg-oro px-5 py-22 md:py-40">
      <div className="mx-auto grid max-w-300 items-center gap-14 md:grid-cols-2 md:gap-16">
        <div className="@container relative mx-auto w-full max-w-140 transition-transform duration-250 ease-[ease] hover:rotate-3 motion-reduce:transition-none max-[479px]:hover:rotate-0">
          <Image
            src="/razglednica.webp"
            alt={t.postcardAlt}
            width={1120}
            height={795}
            loading="lazy"
            sizes="(min-width: 768px) 560px, 100vw"
            className="h-auto w-full drop-shadow-[0_14px_22px_rgba(0,0,0,0.12)]"
          />
          {/* Tekst na levoj polovini razglednice, nagnut kao i ona */}
          <div aria-hidden="true" className="absolute top-[30%] left-[17%] w-[32%] -rotate-3">
            <p className="font-script text-[11cqw] leading-none text-rojo">Hola,</p>
            <p className="mt-[3cqw] ml-[3cqw] font-display text-[4.2cqw] italic text-negro">{t.postcardLine}</p>
          </div>
        </div>
        <div>{body}</div>
      </div>
    </section>
  );
}
