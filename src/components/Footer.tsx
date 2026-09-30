import Link from "next/link";

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-zinc-800 text-zinc-300">
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white">
              Vida<span className="text-amber-400">*</span>
            </Link>
            <div className="mt-6 border-t border-zinc-700 pt-6">
              <p className="italic text-zinc-400">
                Svako može da nauči španski.
              </p>
              <p className="italic text-zinc-400">Baš svako.</p>
              <p className="mt-2 italic text-zinc-400">
                Osim onih koji nikada nisu počeli.
              </p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">Linkovi</h3>
            <ul className="mt-6 flex flex-col gap-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-white"
                >
                  Početna
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="transition-colors hover:text-white"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/o-meni"
                  className="transition-colors hover:text-white"
                >
                  O meni
                </Link>
              </li>
              <li>
                <Link
                  href="/o-meni"
                  className="transition-colors hover:text-white"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Social + contact */}
          <div>
            <h3 className="text-lg font-semibold text-white">Pratite nas</h3>
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com/vida.alaespanola"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-white"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 text-zinc-300 transition-colors hover:bg-zinc-600 hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>

            <h3 className="mt-8 text-lg font-semibold text-white">Kontakt</h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>info@vidaespanol.rs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-700">
        <div className="mx-auto max-w-7xl px-8 py-5 text-center text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Vida Español
        </div>
      </div>
    </footer>
  );
}
