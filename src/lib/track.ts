// Događaji za Google Analytics. Ako GA nije učitan (nema ID-ja), poziv se tiho preskače.
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export type TrackEvent =
  | "forma_zakazivanje_poslata"
  | "kalendar_otvoren"
  | "podeli_post"
  | "klik_profil"
  | "cta_zakazi_cas"
  | "promena_jezika"
  | "jezik_automatski";

export function track(event: TrackEvent, params: Record<string, string> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}
