// Prijava preko GitHub App-a: Worker studio-auth radi razmenu koda (client secret je samo kod njega)
// i vraća token prozoru Studija kroz postMessage. Token se čuva samo do zatvaranja taba.
import { site } from "@/lib/site";

const STORAGE_TOKEN = "vida-studio-token";

export function savedToken(): string {
  try {
    return sessionStorage.getItem(STORAGE_TOKEN) ?? "";
  } catch {
    return "";
  }
}

export function forgetToken() {
  try {
    sessionStorage.removeItem(STORAGE_TOKEN);
  } catch {}
}

export function login(): Promise<string> {
  const authOrigin = new URL(site.studio.authUrl).origin;
  const popup = window.open(
    `${site.studio.authUrl}/login?origin=${encodeURIComponent(window.location.origin)}`,
    "vida-studio-login",
    "width=520,height=720",
  );
  if (!popup) return Promise.reject(new Error("Browser je blokirao prozor za prijavu. Dozvoli iskačuće prozore."));

  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== authOrigin || event.data?.type !== "vida-studio-auth") return;
      cleanup();
      if (event.data.error || !event.data.token) {
        reject(new Error(event.data.error || "Prijava nije uspela."));
        return;
      }
      try {
        sessionStorage.setItem(STORAGE_TOKEN, event.data.token);
      } catch {}
      resolve(event.data.token);
    };
    const closed = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("Prozor za prijavu je zatvoren."));
      }
    }, 500);
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(closed);
    };
    window.addEventListener("message", onMessage);
  });
}

/** AI predlog engleske verzije (Worker poziva Claude; ključ nikad ne dolazi u browser). */
export async function suggestTranslation(token: string, markdown: string): Promise<string> {
  const res = await fetch(`${site.studio.authUrl}/translate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ markdown }),
  });
  const data = (await res.json().catch(() => ({}))) as { markdown?: string; error?: string };
  if (!res.ok || !data.markdown) throw new Error(data.error || "AI predlog trenutno nije dostupan.");
  return data.markdown;
}
