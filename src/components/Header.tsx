import Link from "next/link";

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-white"
        >
          Vida<span className="text-amber-400">*</span>
        </Link>
        <ul className="flex items-center gap-8 text-sm font-medium">
          <li>
            <Link
              href="/"
              className="text-white/80 transition-colors hover:text-white"
            >
              Početna
            </Link>
          </li>
          <li>
            <Link
              href="/blog"
              className="text-white/80 transition-colors hover:text-white"
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              href="/o-meni"
              className="text-white/80 transition-colors hover:text-white"
            >
              O meni
            </Link>
          </li>
          <li>
            <Link
              href="/o-meni"
              className="rounded-full bg-rose-500 px-5 py-2 text-white transition-colors hover:bg-rose-600"
            >
              Kontakt
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
