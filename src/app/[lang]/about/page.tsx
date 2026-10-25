import AboutPage, { aboutMetadata } from "@/components/pages/AboutPage";

// Ova putanja postoji samo na jednom jeziku (prevedene putanje, vidi src/lib/routes.ts).
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export const metadata = aboutMetadata("en");

export default function Page() {
  return <AboutPage lang="en" />;
}
