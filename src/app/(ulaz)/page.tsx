import Link from "next/link";

// Vidljivo samo na trenutak (ili botovima i bez JavaScript-a): ručni izbor jezika.
export default function EntryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <p className="font-display text-4xl font-medium tracking-[0.12em] text-negro">VIDA</p>
        <p className="mt-1 font-display text-lg italic text-naranja">a la española</p>
      </div>
      <p className="font-display text-xl italic text-negro">El idioma se vive.</p>
      <nav className="flex gap-4">
        <Link
          href="/sr"
          hrefLang="sr"
          lang="sr"
          className="btn btn-ghost"
        >
          Srpski
        </Link>
        <Link
          href="/en"
          hrefLang="en"
          lang="en"
          className="btn btn-ghost"
        >
          English
        </Link>
      </nav>
    </main>
  );
}
