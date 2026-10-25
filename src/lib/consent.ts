// Izbor posetioca za kolačiće, deljen između banera i analitike.
export type Consent = "granted" | "denied";

export const CONSENT_KEY = "vida-kolacici";
const CHANGE_EVENT = "vida:consent";
const OPEN_EVENT = "vida:consent-open";

export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // privatni prozor i sl. — izbor važi samo dok je stranica otvorena
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: value }));
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Ponovo otvara baner (link „Podešavanja kolačića“ u footeru). */
export function openConsentBanner() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function subscribeOpenBanner(callback: () => void) {
  window.addEventListener(OPEN_EVENT, callback);
  return () => window.removeEventListener(OPEN_EVENT, callback);
}
