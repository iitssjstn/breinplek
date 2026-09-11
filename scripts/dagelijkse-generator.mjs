// Losstaand van de Next.js-server/bundelaar — wordt door docker-entrypoint.sh
// als eigen achtergrondproces gestart, precies zoals novapers.nl dat doet
// met scripts/rss-scheduler.mjs (zelfde reden: instrumentation.js kan geen
// Node-only modules als fs importeren zonder de standalone-build te breken,
// vercel/next.js#49565).
//
// Novapers.nl haalt onderwerpen uit RSS-feeds. Breinplek heeft die niet, dus
// dit script gebruikt een vaste, roulerende onderwerpenlijst i.p.v. RSS.
//
// LET OP: dit is een los, ongecompileerd Node-script (geen TypeScript, geen
// toegang tot de gebundelde .next-output). Het duplicareert daarom bewust
// een klein stukje logica uit lib/aiProviders.ts, lib/settings.ts en
// lib/onderwerpen.ts in gewone JavaScript. Wijzig je die bestanden, check
// dan of dit script ook een update nodig heeft.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const WACHTRIJ_FILE = path.join(DATA_DIR, 'wachtrij.json');
const STATUS_FILE = path.join(DATA_DIR, 'automatisering.json');
const INSTELLINGEN_FILE = path.join(DATA_DIR, 'instellingen.json');

const TICK_MS = 60 * 60 * 1000; // elk uur checken of het vandaag al is gebeurd

// Zelfde onderwerpenlijst als lib/onderwerpen.ts (zie opmerking daar).
const ONDERWERPEN = [
  { onderwerp: 'Hyperfocus: wanneer het helpt en wanneer het in de weg zit', categorie: 'adhd' },
  { onderwerp: 'Emotieregulatie en ADHD: waarom kleine dingen soms groot aanvoelen', categorie: 'adhd' },
  { onderwerp: 'ADHD en slaap: waarom afschakelen zo moeilijk is', categorie: 'adhd' },
  { onderwerp: 'Impulsief uitgeven: geld en ADHD', categorie: 'adhd' },
  { onderwerp: 'Waarom multitasken met ADHD vaak averechts werkt', categorie: 'adhd' },
  { onderwerp: 'ADHD op het werk: omgaan met open kantoren en afleiding', categorie: 'adhd' },
  { onderwerp: 'Verandering van routine: waarom kleine aanpassingen soms grote impact hebben', categorie: 'autisme' },
  { onderwerp: 'Sociale scripts: waarom ze helpen en waar de grens ligt', categorie: 'autisme' },
  { onderwerp: "Sensorische voorkeuren in kleding en waarom comfort niet 'kinderachtig' is", categorie: 'autisme' },
  { onderwerp: 'Autisme en vriendschappen: kwaliteit boven kwantiteit', categorie: 'autisme' },
  { onderwerp: 'Special interests: waarom een obsessie ook rust kan geven', categorie: 'autisme' },
  { onderwerp: 'Autisme herkennen op latere leeftijd: laat gediagnosticeerd, niet te laat', categorie: 'autisme' },
  { onderwerp: 'Waarom AuDHD vaak later herkend wordt dan ADHD of autisme alleen', categorie: 'audhd' },
  { onderwerp: 'Structuur zoeken én structuur ontvluchten: de innerlijke tegenstelling van AuDHD', categorie: 'audhd' },
  { onderwerp: 'AuDHD en burn-out: dubbele belasting, dubbel herstel nodig', categorie: 'audhd' },
  { onderwerp: "Waarom 'gewoon een planning maken' niet werkt bij AuDHD", categorie: 'audhd' },
  { onderwerp: 'AuDHD en sociale energie: het ene moment behoefte aan mensen, het andere aan stilte', categorie: 'audhd' },
  { onderwerp: 'Medicatie en AuDHD: waarom het proces vaak anders verloopt dan bij ADHD alleen', categorie: 'audhd' },
  { onderwerp: 'Solliciteren met ADHD of autisme: wat je wel en niet moet delen', categorie: 'werk-school' },
  { onderwerp: "Examens en ADHD: strategieën die verder gaan dan 'gewoon leren'", categorie: 'werk-school' },
  { onderwerp: 'Feedback ontvangen als je snel overweldigd raakt', categorie: 'werk-school' },
  { onderwerp: 'Thuiswerken met ADHD: structuur zonder toezicht', categorie: 'werk-school' },
  { onderwerp: 'Functioneringsgesprekken voorbereiden als je moeite hebt met terugkijken', categorie: 'werk-school' },
  { onderwerp: 'Boodschappen doen zonder overprikkeld te raken', categorie: 'dagelijks-leven' },
  { onderwerp: "Administratie bijhouden als 'even een half uurtje' niet bestaat", categorie: 'dagelijks-leven' },
  { onderwerp: 'Verjaardagen en sociale verplichtingen plannen zonder uitputting', categorie: 'dagelijks-leven' },
  { onderwerp: 'Koken voor één: waarom variatie soms juist te veel is', categorie: 'dagelijks-leven' },
  { onderwerp: 'Wat te doen als de was zich opstapelt: kleine systemen die echt werken', categorie: 'dagelijks-leven' },
];

const CATEGORIE_NAMEN = {
  adhd: 'ADHD',
  autisme: 'Autisme',
  audhd: 'AuDHD',
  'werk-school': 'Werk & school',
  'dagelijks-leven': 'Dagelijks leven',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function vandaag() {
  return new Date().toISOString().slice(0, 10);
}

function leesJson(bestand, standaard) {
  if (!fs.existsSync(bestand)) return standaard;
  try {
    return JSON.parse(fs.readFileSync(bestand, 'utf8'));
  } catch {
    return standaard;
  }
}

function schrijfJson(bestand, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(bestand, JSON.stringify(data, null, 2));
}

// Zelfde 3-laags-lookup als lib/settings.ts leesSleutel(): env-variabele,
// dan een *_FILE-pad (Docker-secrets-patroon), dan /admin/instellingen.
function leesSleutel(naam) {
  const bestandsPad = process.env[`${naam}_FILE`];
  if (bestandsPad && fs.existsSync(bestandsPad)) {
    return fs.readFileSync(bestandsPad, 'utf8').trim();
  }
  const uitOmgeving = process.env[naam]?.trim();
  if (uitOmgeving) return uitOmgeving;
  const instellingen = leesJson(INSTELLINGEN_FILE, {});
  return instellingen[naam] || undefined;
}

function parseJsonUitTekst(ruw) {
  const schoon = ruw.trim().replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(schoon);
  } catch {
    const match = schoon.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function verwijderEmojis(tekst) {
  return tekst.replace(/[\p{Extended_Pictographic}\u200d\ufe0f]/gu, '').replace(/[ \t]{2,}/g, ' ');
}

const STIJLINSTRUCTIE = `Je schrijft voor breinplek.nl, een Nederlandse website met praktische tips over ADHD, autisme en AuDHD.
Schrijfstijl: rustig, direct, geen medisch jargon, tweede persoon ("je"), concreet en toepasbaar, geen clichés, geen overdreven positiviteit.
Gebruik GEEN emoji's, ook niet als pictogram of opsommingsteken — puur platte tekst en Markdown (## voor koppen, - voor lijstjes).`;

async function callGoogle(apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4096 },
      }),
    }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text().catch(() => '')).slice(0, 200)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Geen tekst terugontvangen van Gemini.');
  return text;
}

async function callOpenAiCompatibel(baseUrl, apiKey, model, systemPrompt, userPrompt, extraParams = {}) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      ...extraParams,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${(await res.text().catch(() => '')).slice(0, 200)}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Geen tekst terugontvangen van de provider.');
  return content;
}

const PROVIDERS = [
  { label: 'Gemini', sleutelNaam: 'GEMINI_API_KEY', call: (k, s, u) => callGoogle(k, 'gemini-3.5-flash', s, u) },
  {
    label: 'Groq',
    sleutelNaam: 'GROQ_API_KEY',
    call: (k, s, u) =>
      callOpenAiCompatibel('https://api.groq.com/openai/v1', k, 'openai/gpt-oss-120b', s, u, { reasoning_effort: 'low' }),
  },
  {
    label: 'OpenRouter',
    sleutelNaam: 'OPENROUTER_API_KEY',
    call: (k, s, u) => callOpenAiCompatibel('https://openrouter.ai/api/v1', k, 'openrouter/free', s, u),
  },
];

async function genereerMetFallback(systemPrompt, userPrompt) {
  for (const provider of PROVIDERS) {
    const apiKey = leesSleutel(provider.sleutelNaam);
    if (!apiKey) continue;
    try {
      const tekst = await provider.call(apiKey, systemPrompt, userPrompt);
      return { tekst, providerLabel: provider.label };
    } catch (err) {
      console.error(`[dagelijkse-generator] ${provider.label} mislukt:`, err.message);
    }
  }
  return null;
}

function voegToeAanWachtrij(item) {
  const items = leesJson(WACHTRIJ_FILE, []);
  items.push({ ...item, id: crypto.randomUUID(), aangemaaktOp: new Date().toISOString() });
  schrijfJson(WACHTRIJ_FILE, items);
}

async function genereerArtikel(onderwerp, categorieNaam) {
  const systemPrompt = `${STIJLINSTRUCTIE}

Geef ALLEEN geldige JSON terug, zonder markdown-codeblok eromheen, exact in dit formaat:
{"titel": "...", "samenvatting": "één zin, max 20 woorden, voor op een kaartje", "inhoud": "de volledige artikeltekst in Markdown met ## voor tussenkopjes, 300 tot 500 woorden"}`;
  const userPrompt = `Schrijf een artikel over: "${onderwerp}" (categorie: ${categorieNaam}).`;
  const resultaat = await genereerMetFallback(systemPrompt, userPrompt);
  if (!resultaat) return null;
  const concept = parseJsonUitTekst(resultaat.tekst);
  if (!concept?.titel || !concept?.samenvatting || !concept?.inhoud) return null;
  return {
    provider: resultaat.providerLabel,
    titel: verwijderEmojis(concept.titel),
    samenvatting: verwijderEmojis(concept.samenvatting),
    inhoud: verwijderEmojis(concept.inhoud),
  };
}

async function genereerVraag(onderwerp, categorieNaam) {
  const systemPrompt = `${STIJLINSTRUCTIE}

Geef ALLEEN geldige JSON terug, zonder markdown-codeblok, exact in dit formaat:
{"vraag": "de vraag zoals een bezoeker die zou stellen", "antwoordKort": "1-2 zinnen, het korte antwoord voor op de homepage", "antwoord": "het volledige antwoord in Markdown, 150 tot 350 woorden"}`;
  const userPrompt = `Schrijf een vraag-en-antwoord over: "${onderwerp}" (categorie: ${categorieNaam}).`;
  const resultaat = await genereerMetFallback(systemPrompt, userPrompt);
  if (!resultaat) return null;
  const concept = parseJsonUitTekst(resultaat.tekst);
  if (!concept?.vraag || !concept?.antwoordKort || !concept?.antwoord) return null;
  return {
    provider: resultaat.providerLabel,
    vraag: verwijderEmojis(concept.vraag),
    antwoordKort: verwijderEmojis(concept.antwoordKort),
    antwoord: verwijderEmojis(concept.antwoord),
  };
}

async function dagelijkseRun() {
  const status = leesJson(STATUS_FILE, { volgendeIndex: 0, aantalGegenereerd: 0, laatsteRunDatum: null });
  if (status.laatsteRunDatum === vandaag()) return; // vandaag al gedraaid

  const { onderwerp, categorie } = ONDERWERPEN[status.volgendeIndex % ONDERWERPEN.length];
  const categorieNaam = CATEGORIE_NAMEN[categorie] ?? categorie;
  const soort = status.aantalGegenereerd % 2 === 0 ? 'artikel' : 'vraag';

  console.log(`[dagelijkse-generator] genereer ${soort} over "${onderwerp}" (${categorieNaam})`);

  const concept = soort === 'artikel' ? await genereerArtikel(onderwerp, categorieNaam) : await genereerVraag(onderwerp, categorieNaam);

  if (!concept) {
    console.error('[dagelijkse-generator] geen provider gaf een geldig antwoord — probeer morgen opnieuw, onderwerp niet overgeslagen.');
    return;
  }

  voegToeAanWachtrij({ soort, onderwerp, categorie, ...concept });
  schrijfJson(STATUS_FILE, {
    volgendeIndex: (status.volgendeIndex + 1) % ONDERWERPEN.length,
    aantalGegenereerd: status.aantalGegenereerd + 1,
    laatsteRunDatum: vandaag(),
  });
  console.log(`[dagelijkse-generator] concept toegevoegd aan de wachtrij (${concept.provider}) — wacht op goedkeuring in /admin/wachtrij`);
}

process.on('uncaughtException', (err) => {
  console.error('[dagelijkse-generator] onverwachte, niet-afgevangen fout — planner blijft draaien:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[dagelijkse-generator] onverwachte, niet-afgevangen promise-afwijzing — planner blijft draaien:', reason);
});

async function tick() {
  try {
    await dagelijkseRun();
  } catch (err) {
    console.error('[dagelijkse-generator] onverwachte fout tijdens de dagelijkse run:', err.message);
  }
  setTimeout(tick, TICK_MS);
}

console.log('[dagelijkse-generator] gestart — genereert 1x per dag een nieuw concept voor de wachtrij (/admin/wachtrij)');
tick();
