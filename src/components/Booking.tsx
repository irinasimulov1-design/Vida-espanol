"use client";

import { useState } from "react";
import Image from "next/image";
import { getCalApi } from "@calcom/embed-react";
import type { Dictionary } from "@/i18n";
import { site } from "@/lib/site";
import { track } from "@/lib/track";

// Preuzeto iz "prodajna stranica": podaci idu u Google Sheet, termin se bira u Cal.com kalendaru.
const inputClass =
  "w-full border-0 border-b border-negro/30 bg-transparent px-0 py-3 text-negro placeholder:text-negro/40 transition-colors focus:border-negro focus:outline-none";

export default function Booking({ t }: { t: Dictionary["booking"] }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const openCalendar = async () => {
    const cal = await getCalApi();
    cal("modal", {
      calLink: site.booking.calLink,
      config: {
        layout: "month_view",
        name: `${firstName} ${lastName}`,
        email,
      },
    });
    track("kalendar_otvoren");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) return;

    setLoading(true);

    try {
      await fetch(site.booking.googleScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: {
            name: firstName,
            email,
            responses: {
              lastName,
              phone,
            },
          },
        }),
      });
    } catch {
      // ignore — no-cors won't return a readable response
    }

    track("forma_zakazivanje_poslata");
    setSubmitted(true);
    setLoading(false);
    await openCalendar();
  };

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setSubmitted(false);
  };

  const fields = [
    { id: "first-name", label: t.firstName, placeholder: t.firstNamePlaceholder, type: "text", autoComplete: "given-name", value: firstName, set: setFirstName },
    { id: "last-name", label: t.lastName, placeholder: t.lastNamePlaceholder, type: "text", autoComplete: "family-name", value: lastName, set: setLastName },
    { id: "email", label: t.email, placeholder: t.emailPlaceholder, type: "email", autoComplete: "email", value: email, set: setEmail },
    { id: "phone", label: t.phone, placeholder: t.phonePlaceholder, type: "tel", autoComplete: "tel", value: phone, set: setPhone },
  ];

  // Tekst i forma levo, telefon desno (na mobilnom iznad teksta). Hover na sekciju telefon
  // blago nagne i podigne, kao da zvoni.
  return (
    <section id="zakazi-cas" className="group scroll-mt-6 bg-blanco py-22 md:py-40">
      <div className="mx-auto grid max-w-300 items-center gap-14 px-5 md:grid-cols-2 md:gap-16 md:px-8">
        <div className="mx-auto w-[70%] max-w-120 md:order-last md:w-full">
          <Image
            src="/telefon-crveni.webp"
            alt={t.phoneAlt}
            width={960}
            height={725}
            loading="lazy"
            sizes="(min-width: 768px) 480px, 70vw"
            className="h-auto w-full transition-transform duration-250 ease-[ease] group-hover:-translate-y-1 group-hover:-rotate-3 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:rotate-0"
            style={{ filter: "drop-shadow(0 18px 24px rgba(0,0,0,.14)) drop-shadow(0 4px 6px rgba(0,0,0,.08))" }}
          />
        </div>

        <div>
          <p className="text-center eyebrow md:text-left">{t.eyebrow}</p>
          <h2 className="mt-6 text-center md:text-left">
            {t.title}
          </h2>
          <p className="mx-auto mt-6 mb-14 max-w-140 text-center md:mx-0 md:text-left">
            {t.text}
          </p>
  
          <div className="mx-auto max-w-md border border-linija bg-papel p-8 shadow-papel md:mx-0">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field) => (
                  <div key={field.id}>
                    <label
                      htmlFor={`booking-${field.id}`}
                      className="mb-1 block text-sm text-negro"
                    >
                      {field.label} <span className="text-naranja">*</span>
                    </label>
                    <input
                      id={`booking-${field.id}`}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      value={field.value}
                      onChange={(e) => field.set(e.target.value)}
                      required
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 btn w-full"
                >
                  {loading ? t.sending : t.submit}
                </button>
              </form>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-oro">
                  <span className="text-3xl text-negro">✓</span>
                </div>
                <h3 className="mb-2 text-negro">
                  {t.thanks.replace("{ime}", firstName)}
                </h3>
                <p className="mb-4 text-sm text-negro/75">{t.saved}</p>
                <p className="mb-6 text-sm text-negro/75">{t.notOpened}</p>
                <button
                  onClick={openCalendar}
                  className="btn w-full"
                >
                  {t.openCalendar}
                </button>
                <button
                  onClick={handleReset}
                  className="mt-4 text-sm link"
                >
                  {t.again}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
