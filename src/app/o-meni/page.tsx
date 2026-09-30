import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O meni — Vida Español",
  description: "Saznajte više o autoru bloga Vida Español.",
};

export default function AboutPage() {
  return (
    <>
      {/* Ko je — intro section */}
      <section className="bg-zinc-50 pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900">
            Ko je Irina Stojanović?
          </h1>

          <div className="mt-10 flex flex-col gap-5 text-zinc-600 leading-relaxed">
            <p>
              <strong className="text-zinc-800">Da se upoznamo:</strong>
              <br />
              Ja sam Irina Stojanović, autorka bloga Vida Español. Španski jezik me je oduvek
              fascinirao i odlučila sam da svoja iskustva podelim sa svima
              koji kreću istim putem.
            </p>
            <p>
              Kroz godine učenja skupila sam mnoštvo korisnih saveta,
              tehnika i resursa. Od prvih koraka u učenju osnova, preko
              gramatičkih izazova, do trenutka kada sam počela da se
              slobodno izražavam na španskom — svaki korak je bio vredan
              truda.
            </p>
            <p>
              Diplome i sertifikati su važni, ali ono što donosi najveće
              zadovoljstvo jeste videti kako drugi napreduju. Svaki
              komentar, svaka poruka u kojoj neko kaže da mu je tekst
              pomogao — to je najlepša potvrda.
            </p>
            <p>
              Takođe, radujem se i ponosna sam na svakodnevne poruke koje
              dobijam od ljudi na društvenim mrežama. Zahvaljujući objavama
              na blogu i Instagramu, mnogi su pronašli dodatnu podršku i
              motivaciju za učenje španskog jezika.
            </p>
          </div>

          <Link
            href="https://instagram.com/vida.alaespanola"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            Piši mi!
          </Link>
        </div>
      </section>

      {/* Šta je najvažnije — method section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-zinc-900">
            Šta je najvažnije?
          </h2>

          <div className="mt-14 flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
            {/* Image */}
            <div className="shrink-0">
              <Image
                src="/pexels-mikhail-nilov-6981004.jpg"
                alt="Učiteljica španskog jezika"
                width={560}
                height={700}
                className="w-full max-w-md rounded-2xl object-cover object-top lg:w-140"
              />
            </div>

            {/* 3 pillars */}
            <div className="flex flex-col gap-10">
              {/* 1. Vokabular */}
              <div className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H19a1 1 0 011 1v18a1 1 0 01-1 1H6.5a1 1 0 010-5H20" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    1. VO — Vokabular
                  </h3>
                  <p className="mt-2 leading-relaxed text-zinc-600">
                    Sve počinje sa rečima. Prvo nauči reči, a zatim od njih
                    sklapaj rečenice. Na blogu učiš razne tehnike za lakše
                    pamćenje reči i izraza koji se zaista koriste u
                    svakodnevnom životu.
                  </p>
                </div>
              </div>

              {/* 2. Komunikacija */}
              <div className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    2. KU — Komunikacija
                  </h3>
                  <p className="mt-2 leading-relaxed text-zinc-600">
                    Naučene reči postaju vredne kroz praktičnu komunikaciju.
                    Učimo kroz dijaloge u realnim situacijama — restoran,
                    putovanje, posao — i upoznajemo kulturu španskog
                    govornog područja.
                  </p>
                </div>
              </div>

              {/* 3. Motivacija */}
              <div className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    3. M — Motivacija
                  </h3>
                  <p className="mt-2 leading-relaxed text-zinc-600">
                    Svakome je potrebna podrška i motivacija. Cilj je da
                    uspešno progovoriš španski. Odustajanje nije opcija!
                    Kroz blog delim priče, savete i inspiraciju koja te
                    drži na pravom putu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
