"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Došlo je do greške.");
        return;
      }

      setStatus("success");
      setMessage("Uspešno si se prijavila! 🎉");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Došlo je do greške. Pokušaj ponovo.");
    }
  };

  return (
    <section className="relative overflow-hidden py-24">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/Newsletter.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-zinc-100/85" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
          Pridruži se našoj{" "}
          <span className="text-orange-400">porodici</span> od 15.000+
          učenika španskog.
        </h2>

        <p className="mt-5 text-base leading-relaxed text-zinc-600">
          Uživaš u sadržaju? Pridruži nam se. Svake nedelje dobijaš nove
          priče, savete za španski i novosti. To je najbolji način da ostaneš
          u kontaktu i nastaviš da napreduješ. Drago mi je što si ovde 💚
        </p>

        {status === "success" ? (
          <p className="mt-8 text-lg font-semibold text-teal-600">{message}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 flex justify-center gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tvoja email adresa.."
                disabled={status === "loading"}
                className="w-full max-w-sm rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="shrink-0 rounded-full bg-orange-400 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
              >
                {status === "loading" ? "Slanje..." : "Pridruži se"}
              </button>
            </form>

            {status === "error" && (
              <p className="mt-3 text-sm text-red-500">{message}</p>
            )}
          </>
        )}

        <p className="mt-4 text-xs text-zinc-400">
          Prijavom prihvataš naše uslove i politiku privatnosti. Odjavi se u
          bilo kom trenutku.
        </p>
      </div>
    </section>
  );
}
