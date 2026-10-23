"use client";

import { useState } from "react";
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

  return (
    <section id="zakazi-cas" className="scroll-mt-20 bg-hormigon py-18 inset-shadow-sekcija-svetla md:py-30">
      <div className="mx-auto max-w-300 px-4 md:px-8">
        <p className="text-center eyebrow">{t.eyebrow}</p>
        <h2 className="mt-2 text-center text-negro">
          {t.title}
        </h2>
        <p className="mx-auto mt-4 mb-12 max-w-2xl text-center text-negro/75">
          {t.text}
        </p>

        <div className="mx-auto max-w-md border border-linija bg-papel p-8 shadow-papel">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={`booking-${field.id}`}
                    className="mb-1 block text-sm font-medium text-negro"
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
    </section>
  );
}
