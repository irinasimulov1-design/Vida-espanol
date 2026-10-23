import { Outfit, Playfair_Display } from "next/font/google";

export const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

export const fontClasses = `${outfit.variable} ${playfair.variable}`;
