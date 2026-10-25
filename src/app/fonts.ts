import { Abril_Fatface, Cormorant_Garamond, Mrs_Saint_Delafield, Outfit } from "next/font/google";

// Tekst, UI, oznake
export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Naslovi i logo; naglašena reč ide u italiku
export const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Rukopis: samo 1–2 reči (npr. „Hola,“)
export const mrsSaintDelafield = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint-delafield",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  preload: false,
});

// Samo vintage posteri i razglednice
export const abrilFatface = Abril_Fatface({
  variable: "--font-abril-fatface",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  preload: false,
});

export const fontClasses = [outfit, cormorant, mrsSaintDelafield, abrilFatface]
  .map((font) => font.variable)
  .join(" ");
