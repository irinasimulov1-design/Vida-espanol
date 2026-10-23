import PrivacyPage, { privacyMetadata } from "@/components/pages/PrivacyPage";

// Ova putanja postoji samo na jednom jeziku (prevedene putanje, vidi src/lib/routes.ts).
export function generateStaticParams() {
  return [{ lang: "en" }];
}

export const metadata = privacyMetadata("en");

export default function Page() {
  return <PrivacyPage lang="en" />;
}
