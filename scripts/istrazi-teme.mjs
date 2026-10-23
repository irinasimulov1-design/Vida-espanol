#!/usr/bin/env node
// Istraživanje tema za blog: šta ljudi stvarno kucaju u Google (Autocomplete),
// posebno za srpsko i englesko tržište, plus gotovi Google Trends linkovi za poređenje.
//
// Pokretanje:   npm run istrazi
//               npm run istrazi -- --brzo        (bez abecede: ~10x manje upita)
//               npm run istrazi -- --samo=sr     (samo jedno tržište)
// Početne fraze se menjaju u scripts/teme-seed.json.
// Rezultat: istrazivanje/teme-YYYY-MM-DD.md i .csv

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const fast = args.includes("--brzo");
const only = args.find((a) => a.startsWith("--samo="))?.split("=")[1];
const DELAY_MS = 350; // pristojna pauza između upita

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function suggest(query, hl, gl) {
  const url =
    "https://suggestqueries.google.com/complete/search?client=firefox&ie=utf-8&oe=utf-8" +
    `&hl=${hl}&gl=${gl}&q=${encodeURIComponent(query)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (vida-istrazivanje-tema)" } });
      if (res.status === 429) {
        await sleep(5000 * (attempt + 1));
        continue;
      }
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data[1]) ? data[1] : [];
    } catch {
      await sleep(1000);
    }
  }
  return [];
}

function variants(seed, market) {
  const list = [seed];
  for (const q of market.pitanja) list.push(`${q} ${seed}`);
  if (!fast) for (const letter of market.slova) list.push(`${seed} ${letter}`);
  return list;
}

// "kako nauciti" i "kako naučiti" su isti upit: porede se bez kvačica.
const plain = (text) =>
  text.toLowerCase().replace(/đ/g, "dj").normalize("NFD").replace(/[̀-ͯ]/g, "");

function isQuestion(text, market) {
  const t = plain(text);
  return market.pitanja.some((q) => t.startsWith(plain(q) + " ")) || t.endsWith("?");
}

const isExcluded = (text, market) =>
  (market.iskljuci ?? []).some((word) => plain(text).includes(plain(word)));

const trendsUrl = (terms, geo) =>
  `https://trends.google.com/trends/explore?date=today%2012-m&geo=${geo}&q=` +
  terms.slice(0, 5).map(encodeURIComponent).join(",");

async function researchMarket(key, market) {
  // predlog -> { score, count, seeds:Set }
  const found = new Map();
  const queries = market.fraze.flatMap((seed) =>
    market.gl.flatMap((gl) => variants(seed, market).map((q) => ({ seed, gl, q })))
  );

  let done = 0;
  for (const { seed, gl, q } of queries) {
    const suggestions = await suggest(q, market.hl, gl);
    suggestions.forEach((s, i) => {
      const text = s.trim().toLowerCase();
      if (!text || plain(text) === plain(seed) || isExcluded(text, market)) return;
      const key = plain(text);
      const entry = found.get(key) ?? { text, score: 0, count: 0, seeds: new Set() };
      if (text !== key) entry.text = text; // prikazuje se verzija sa kvačicama, ako postoji
      entry.score += 10 - Math.min(i, 9); // viši predlog = jači signal
      entry.count += 1;
      entry.seeds.add(seed);
      found.set(key, entry);
    });
    done++;
    if (done % 25 === 0 || done === queries.length) {
      process.stdout.write(`\r  [${key}] ${done}/${queries.length} upita, ${found.size} predloga`);
    }
    await sleep(DELAY_MS);
  }
  process.stdout.write("\n");

  return [...found.values()]
    .map((e) => ({ text: e.text, score: e.score, count: e.count, seeds: [...e.seeds], question: isQuestion(e.text, market) }))
    .sort((a, b) => b.score - a.score);
}

function marketReport(key, market, rows) {
  const lines = [`## ${market.naziv}`, ""];
  if (rows.length === 0) {
    lines.push("_Nema rezultata (Google možda privremeno ograničava upite — probaj kasnije ili sa `--brzo`)._", "");
    return lines.join("\n");
  }

  lines.push(
    `Poređenje početnih fraza na Google Trends-u: [otvori](${trendsUrl(market.fraze, market.trendsGeo)})`,
    "",
    "### Najjači predlozi",
    "",
    "| # | Šta ljudi kucaju | Skor | Pojavljivanja |",
    "|---|---|---|---|",
    ...rows.slice(0, 40).map((r, i) => `| ${i + 1} | ${r.question ? "❓ " : ""}${r.text} | ${r.score} | ${r.count} |`),
    "",
    "### Pitanja (najbolji kandidati za GEO: naslov, „Ukratko“ i FAQ)",
    "",
    ...rows.filter((r) => r.question).slice(0, 25).map((r) => `- ${r.text}`),
    ""
  );

  for (const seed of market.fraze) {
    const top = rows.filter((r) => r.seeds.includes(seed)).slice(0, 12);
    if (top.length === 0) continue;
    lines.push(
      `### Tema: „${seed}“`,
      "",
      `[Trends: top 5 iz ove teme](${trendsUrl(top.map((r) => r.text), market.trendsGeo)})`,
      "",
      ...top.map((r) => `- ${r.text} _(skor ${r.score})_`),
      ""
    );
  }
  return lines.join("\n");
}

const csvCell = (v) => `"${String(v).replace(/"/g, '""')}"`;

async function main() {
  const config = JSON.parse(await readFile(path.join(root, "scripts", "teme-seed.json"), "utf8"));
  const markets = Object.entries(config).filter(([key]) => !only || key === only);
  const date = new Date().toISOString().slice(0, 10);

  console.log(`Istraživanje tema (${fast ? "brzo, bez abecede" : "puno"}) — ${markets.map(([k]) => k).join(", ")}`);

  const sections = [];
  const csv = [["trziste", "predlog", "skor", "pojavljivanja", "pitanje", "teme"].map(csvCell).join(",")];

  for (const [key, market] of markets) {
    const rows = await researchMarket(key, market);
    sections.push(marketReport(key, market, rows));
    for (const r of rows) {
      csv.push([key, r.text, r.score, r.count, r.question ? "da" : "ne", r.seeds.join(" | ")].map(csvCell).join(","));
    }
  }

  const report = [
    `# Istraživanje tema — ${date}`,
    "",
    "Izvor: Google Autocomplete (stvarni upiti, bez broja pretraga). **Skor** = koliko se predlog često i koliko visoko javljao kroz varijante upita.",
    "Za obim i sezonalnost otvori Trends linkove. Za konačan izbor 10–15 udarnih tema gledaj: visok skor + pitanje + tema u kojoj Irina ima šta lično da kaže.",
    "",
    ...sections,
  ].join("\n");

  const outDir = path.join(root, "istrazivanje");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, `teme-${date}.md`), report, "utf8");
  await writeFile(path.join(outDir, `teme-${date}.csv`), "﻿" + csv.join("\n"), "utf8");
  console.log(`Gotovo: istrazivanje/teme-${date}.md i .csv`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
