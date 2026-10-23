import Link from "next/link";

// Vidljivo samo na trenutak (ili botovima i bez JavaScript-a): ručni izbor jezika.
export default function EntryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <p className="font-serif text-4xl font-bold tracking-[0.12em] text-braon">VIDA</p>
        <p className="mt-1 font-serif text-lg italic text-terracotta">a la española</p>
      </div>
      <p className="font-serif text-xl italic text-braon">El idioma se vive.</p>
      <nav className="flex gap-4">
        <Link
          href="/sr"
          hrefLang="sr"
          lang="sr"
          className="rounded-full border border-braon/30 px-6 py-3 text-sm font-semibold text-braon transition-colors hover:bg-bez"
        >
          Srpski
        </Link>
        <Link
          href="/en"
          hrefLang="en"
          lang="en"
          className="rounded-full border border-braon/30 px-6 py-3 text-sm font-semibold text-braon transition-colors hover:bg-bez"
        >
          English
        </Link>
      </nav>
    </main>
  );
}
