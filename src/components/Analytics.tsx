"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { site } from "@/lib/site";
import { CONSENT_KEY, readConsent, subscribeConsent } from "@/lib/consent";
import { STORAGE_AUTO, type Locale } from "@/i18n/config";
import { track } from "@/lib/track";

const { ga4, clarity } = site.analytics;

// Google Consent Mode v2: sve je "denied" dok posetilac ne prihvati.
// Sačuvan izbor se čita odmah, pre prvog GA zahteva, da ne bi bilo trke sa banerom.
const gaBootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
var c = null; try { c = localStorage.getItem('${CONSENT_KEY}'); } catch (e) {}
gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: c === 'granted' ? 'granted' : 'denied',
  wait_for_update: 500
});
gtag('js', new Date());
gtag('config', '${ga4}');
`;

const clarityBootstrap = `
(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");
window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
`;

// Napomena: id-jevi skripti ne smeju biti "clarity" / "ga" / "gtag" — browser izlaže elemente
// po id-ju kao window.<id>, pa bi window.clarity postao <script> element umesto funkcije.
export default function Analytics({ lang }: { lang: Locale }) {
  const consent = useSyncExternalStore(subscribeConsent, readConsent, () => null);

  // Promena izbora posle učitavanja (baner ili „Podešavanja kolačića“).
  useEffect(() => {
    if (!consent) return;
    window.gtag?.("consent", "update", { analytics_storage: consent });
    if (consent === "denied") window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
  }, [consent]);

  // Ulazna strana je posetioca automatski poslala na ovaj jezik: beležimo to jednom.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_AUTO)) {
        sessionStorage.removeItem(STORAGE_AUTO);
        track("jezik_automatski", { jezik: lang, browser: navigator.languages.join(",") });
      }
    } catch {
      // sessionStorage nedostupan — događaj se preskače
    }
  }, [lang]);

  return (
    <>
      {ga4 && (
        <>
          <Script id="vida-ga4-init" strategy="afterInteractive">
            {gaBootstrap}
          </Script>
          <Script
            id="vida-ga4-gtag"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
        </>
      )}
      {clarity && consent === "granted" && (
        <Script id="vida-clarity-init" strategy="afterInteractive">
          {clarityBootstrap}
        </Script>
      )}
    </>
  );
}
