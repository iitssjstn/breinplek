// Genereert een concept-artikel of -vraag met een AI-tekstmodel. Zelfde
// methode als novapers.nl: de officiële Google-SDK voor Gemini (niet een
// losse fetch-aanroep — die liep vast op verouderde model/API-aannames),
// een gedeelde OpenAI-compatibele aanroep voor Groq/OpenRouter, en een lange
// (60s) timeout omdat gratis lagen van deze providers soms traag zijn —
// een te korte timeout forceert onterecht een mislukte poging.
//
// API-sleutels komen uit environment-variabelen, uit een bestand waarvan
// het pad in <NAAM>_FILE staat (Docker-secrets-patroon), of uit
// /admin/instellingen. Geen van de drie is verplicht: providers zonder
// sleutel worden gewoon overgeslagen.

import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSetting } from './settings';

export interface ArtikelConcept {
  titel: string;
  samenvatting: string;
  inhoud: string; // Markdown
}

export interface VraagConcept {
  vraag: string;
  antwoordKort: string;
  antwoord: string; // Markdown
}

function leesSleutel(naam: string): string | undefined {
  const bestandsPad = process.env[`${naam}_FILE`];
  if (bestandsPad && fs.existsSync(bestandsPad)) {
    return fs.readFileSync(bestandsPad, 'utf8').trim();
  }
  const uitOmgeving = process.env[naam]?.trim();
  if (uitOmgeving) return uitOmgeving;

  // Geen environment-variabele of secret-bestand? Kijk of de sleutel via
  // het adminpaneel (/admin/instellingen) is ingevoerd.
  return getSetting(naam);
}

export function isAIConfigured(): boolean {
  return Boolean(leesSleutel('GEMINI_API_KEY') || leesSleutel('GROQ_API_KEY') || leesSleutel('OPENROUTER_API_KEY'));
}

// --- Providers: zelfde twee bouwstenen als novapers.nl ---

async function callGoogle({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
}: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
    },
  });
  const result = await genModel.generateContent(userPrompt);
  return result.response.text();
}

// Groq en OpenRouter bieden allebei een OpenAI-compatibele
// chat-completions-API aan, dus één generieke fetch-aanroep bedient beide.
async function callOpenAICompatible({
  baseUrl,
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  extraParams = {},
}: {
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  extraParams?: Record<string, unknown>;
}): Promise<string> {
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

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} — ${bodyText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Geen tekst terugontvangen van de provider.');
  return content;
}

interface Provider {
  id: string;
  label: string;
  sleutelNaam: string;
  call: (apiKey: string, systemPrompt: string, userPrompt: string) => Promise<string>;
}

// Zelfde providers en modellen als novapers.nl gebruikt (stand: 2026) — dit
// zijn de op dit moment bevestigd werkende, niet-uitgefaseerde modellen.
const PROVIDERS: Provider[] = [
  {
    id: 'gemini',
    label: 'Gemini',
    sleutelNaam: 'GEMINI_API_KEY',
    call: (apiKey, systemPrompt, userPrompt) =>
      callGoogle({ apiKey, model: 'gemini-3.5-flash', systemPrompt, userPrompt }),
  },
  {
    id: 'groq',
    label: 'Groq',
    sleutelNaam: 'GROQ_API_KEY',
    call: (apiKey, systemPrompt, userPrompt) =>
      callOpenAICompatible({
        baseUrl: 'https://api.groq.com/openai/v1',
        apiKey,
        model: 'openai/gpt-oss-120b',
        systemPrompt,
        userPrompt,
        // Reasoning-model: zonder dit kan het z'n eigen redeneerstappen in
        // het antwoord lekken, wat de JSON-parsing breekt.
        extraParams: { reasoning_effort: 'low' },
      }),
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    sleutelNaam: 'OPENROUTER_API_KEY',
    call: (apiKey, systemPrompt, userPrompt) =>
      callOpenAICompatible({
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKey,
        model: 'openrouter/free',
        systemPrompt,
        userPrompt,
      }),
  },
];

// 60s, niet 15s: een gratis-laag-respons van Gemini/Groq kan soms ruim
// boven de 25s duren. Een te korte timeout forceert dan onterecht een
// mislukte poging in plaats van gewoon even op het antwoord te wachten.
const PROVIDER_TIMEOUT_MS = 60_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout na ${ms / 1000}s`)), ms)
    ),
  ]);
}

async function callWithFallback(
  systemPrompt: string,
  userPrompt: string
): Promise<{ rawText: string | null; providerLabel: string | null; poging: string[] }> {
  const poging: string[] = [];

  for (const provider of PROVIDERS) {
    const apiKey = leesSleutel(provider.sleutelNaam);
    if (!apiKey) continue;

    try {
      const rawText = await withTimeout(provider.call(apiKey, systemPrompt, userPrompt), PROVIDER_TIMEOUT_MS);
      return { rawText, providerLabel: provider.label, poging };
    } catch (err) {
      const bericht = err instanceof Error ? err.message : String(err);
      poging.push(`${provider.label}: ${bericht}`);
      console.error(`[aiProviders] ${provider.label} mislukt:`, bericht);
    }
  }

  if (poging.length === 0) {
    poging.push('Geen enkele provider heeft een API-sleutel ingesteld.');
  }
  return { rawText: null, providerLabel: null, poging };
}

// Vangnet: het model volgt "geen emoji's" meestal, maar niet altijd. Haalt
// ze er hier hoe dan ook uit i.p.v. te vertrouwen op de instructie alleen.
function verwijderEmojis(tekst: string): string {
  return tekst.replace(/[\p{Extended_Pictographic}\u200d\ufe0f]/gu, '').replace(/[ \t]{2,}/g, ' ');
}

function parseJsonUitTekst<T>(ruw: string): T | null {
  const schoon = ruw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '');
  try {
    return JSON.parse(schoon) as T;
  } catch {
    const match = schoon.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

const STIJLINSTRUCTIE = `Je schrijft voor breinplek.nl, een Nederlandse website met praktische tips over ADHD, autisme en AuDHD.
Schrijfstijl: rustig, direct, geen medisch jargon, tweede persoon ("je"), concreet en toepasbaar, geen clichés, geen overdreven positiviteit.
Gebruik GEEN emoji's, ook niet als pictogram of opsommingsteken — puur platte tekst en Markdown (## voor koppen, - voor lijstjes).`;

export async function genereerArtikelConcept(
  onderwerp: string,
  categorieNaam: string
): Promise<{ concept: ArtikelConcept | null; provider: string | null; foutdetail?: string }> {
  const systemPrompt = `${STIJLINSTRUCTIE}

Geef ALLEEN geldige JSON terug, zonder markdown-codeblok eromheen, exact in dit formaat:
{"titel": "...", "samenvatting": "één zin, max 20 woorden, voor op een kaartje", "inhoud": "de volledige artikeltekst in Markdown met ## voor tussenkopjes, 300 tot 500 woorden"}`;
  const userPrompt = `Schrijf een artikel over: "${onderwerp}" (categorie: ${categorieNaam}).`;

  const resultaat = await callWithFallback(systemPrompt, userPrompt);
  if (!resultaat.rawText) {
    return { concept: null, provider: null, foutdetail: resultaat.poging.join(' | ') };
  }

  const concept = parseJsonUitTekst<ArtikelConcept>(resultaat.rawText);
  if (!concept?.titel || !concept?.samenvatting || !concept?.inhoud) {
    return { concept: null, provider: resultaat.providerLabel, foutdetail: 'Antwoord kon niet als JSON worden gelezen.' };
  }
  return {
    concept: {
      titel: verwijderEmojis(concept.titel),
      samenvatting: verwijderEmojis(concept.samenvatting),
      inhoud: verwijderEmojis(concept.inhoud),
    },
    provider: resultaat.providerLabel,
  };
}

export async function genereerVraagConcept(
  onderwerp: string,
  categorieNaam: string
): Promise<{ concept: VraagConcept | null; provider: string | null; foutdetail?: string }> {
  const systemPrompt = `${STIJLINSTRUCTIE}

Geef ALLEEN geldige JSON terug, zonder markdown-codeblok, exact in dit formaat:
{"vraag": "de vraag zoals een bezoeker die zou stellen", "antwoordKort": "1-2 zinnen, het korte antwoord voor op de homepage", "antwoord": "het volledige antwoord in Markdown, 150 tot 350 woorden"}`;
  const userPrompt = `Schrijf een vraag-en-antwoord over: "${onderwerp}" (categorie: ${categorieNaam}).`;

  const resultaat = await callWithFallback(systemPrompt, userPrompt);
  if (!resultaat.rawText) {
    return { concept: null, provider: null, foutdetail: resultaat.poging.join(' | ') };
  }

  const concept = parseJsonUitTekst<VraagConcept>(resultaat.rawText);
  if (!concept?.vraag || !concept?.antwoordKort || !concept?.antwoord) {
    return { concept: null, provider: resultaat.providerLabel, foutdetail: 'Antwoord kon niet als JSON worden gelezen.' };
  }
  return {
    concept: {
      vraag: verwijderEmojis(concept.vraag),
      antwoordKort: verwijderEmojis(concept.antwoordKort),
      antwoord: verwijderEmojis(concept.antwoord),
    },
    provider: resultaat.providerLabel,
  };
}
