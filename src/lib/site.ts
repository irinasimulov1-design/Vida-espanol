// Jedno mesto za sve što se menja van koda: domen, ID-jevi alata, linkovi profila.
// Prazan string = ta stvar se ne prikazuje / ne učitava.

export const site = {
  url: "https://vidaspanish.com", // menja se zajedno sa public/CNAME
  name: "VIDA — a la española",
  email: "info@vidaespanol.rs",

  author: {
    name: "Irina Stojanović",
    image: "/irina.jpg",
  },

  analytics: {
    ga4: "", // Google Analytics 4, npr. "G-ABC123XYZ"
    clarity: "", // Microsoft Clarity project ID, npr. "abcd1234ef"
  },

  verification: {
    google: "", // Search Console → HTML tag → vrednost iz content="..."
    bing: "", // Bing Webmaster Tools → HTML Meta Tag → vrednost iz content="..."
  },

  // IndexNow ključ (Bing, Yandex…). Mora da postoji i public/<ključ>.txt sa istim sadržajem.
  indexNowKey: "5f0c8e3a9b2d4c71a6e8f3b1d2c4a9e7",

  social: {
    // Prazno polje = ikonica se prikazuje kao neaktivna („uskoro“) dok se ne upiše link.
    instagram: "https://instagram.com/vida.alaespanola",
    youtube: "", // npr. "https://www.youtube.com/@vida.alaespanola"
    preply: "", // npr. "https://preply.com/en/tutor/123456"
    linkedin: "", // npr. "https://www.linkedin.com/in/irina-stojanovic"
  },

  booking: {
    calLink: "teacher-ina/30min",
    googleScriptUrl:
      "https://script.google.com/macros/s/AKfycbyPZPp0Db3_WISOj4oeEueSDtASeg-seDR5bfbEus10PbPFoYcRl-6iNr7gZ1PMibde9Q/exec",
  },

  // VIDA Studio (/studio): editor bloga na sajtu. Čuvanje = commit u repo → deploy.yml objavi.
  // Podešavanje GitHub App-a i Workera: docs/studio.md. Prazan authUrl = Studio je isključen.
  studio: {
    repo: "irinasimulov1-design/Vida-espanol",
    // Grana u koju Studio upisuje. Sajt se objavljuje samo sa "master"; druga grana = proba.
    branch: "studio-proba",
    // Iz koje grane nastaje `branch` ako još ne postoji (i odakle se čita do tada).
    // Dok dvojezični sajt nije spojen u master, to je njegova grana.
    baseBranch: "dvojezicni-blog-geo",
    authUrl: "", // Cloudflare Worker studio-auth, npr. "https://vida-studio-auth.<nalog>.workers.dev"
  },
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).toString();
}
