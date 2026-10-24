import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fontClasses } from "../fonts";
import "../globals.css";

// VIDA Studio: editor bloga samo za Irinu. Bez headera, footera, analitike i kolačića; ne indeksira se.
export const metadata: Metadata = {
  title: "Studio — VIDA a la española",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr" className={`${fontClasses} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
