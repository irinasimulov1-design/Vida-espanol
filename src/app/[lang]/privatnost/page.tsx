import PrivacyPage, { privacyMetadata } from "@/components/pages/PrivacyPage";

// Ova putanja postoji samo na jednom jeziku (prevedene putanje, vidi src/lib/routes.ts).
export function generateStaticParams() {
  return [{ lang: "sr" }];
}

export const metadata = privacyMetadata("sr");

export default function Page() {
  return <PrivacyPage lang="sr" />;
}
