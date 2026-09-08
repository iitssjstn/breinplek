// Genereert een concept-artikel of -vraag met een AI-tekstmodel. Net als
// novapers proberen we meerdere providers, in volgorde, en gebruiken we de
// eerste die een geldig antwoord geeft (Gemini -> Groq -> OpenRouter).
//
// API-sleutels komen uit environment-variabelen, of — als je liever geen
// plaintext secrets in docker-compose zet — uit een bestand waarvan het pad
// in <NAAM>_FILE staat (zelfde patroon als Docker secrets). Geen van de drie
// is verplicht: providers zonder sleutel worden gewoon overgeslagen.

import fs from 'fs';
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

function parseJsonUitTekst<T>(ruw: string): T | null {
  const schoon = ruw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '');
  try {
    return JSON.parse(schoon) as T;
  } catch {
    // Soms zit de JSON tussen extra tekst; pak het eerste { ... } blok.
    const match = schoon.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

async function viaGemini(prompt: string): Promise<string | null> {
  const key = leesSleutel('GEMINI_API_KEY');
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

async function viaOpenAiCompatibel(
  url: string,
  sleutelNaam: string,
  model: string,
  prompt: string
): Promise<string | null> {
  const key = leesSleutel(sleutelNaam);
  if (!key) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

async function genereerRuweTekst(prompt: string): Promise<{ tekst: string; provider: string } | null> {
  const gemini = await viaGemini(prompt);
  if (gemini) return { tekst: gemini, provider: 'Gemini' };

  const groq = await viaOpenAiCompatibel(
    'https://api.groq.com/openai/v1/chat/completions',
    'GROQ_API_KEY',
    'llama-3.1-8b-instant',
    prompt
  );
  if (groq) return { tekst: groq, provider: 'Groq' };

  const openrouter = await viaOpenAiCompatibel(
    'https://openrouter.ai/api/v1/chat/completions',
    'OPENROUTER_API_KEY',
    'meta-llama/llama-3.1-8b-instruct:free',
    prompt
  );
  if (openrouter) return { tekst: openrouter, provider: 'OpenRouter' };

  return null;
}

const STIJLINSTRUCTIE = `Je schrijft voor breinplek.nl, een Nederlandse website met praktische tips over ADHD, autisme en AuDHD.
Schrijfstijl: rustig, direct, geen medisch jargon, tweede persoon ("je"), concreet en toepasbaar, geen clichés, geen overdreven positiviteit.`;

export async function genereerArtikelConcept(
  onderwerp: string,
  categorieNaam: string
): Promise<{ concept: ArtikelConcept | null; provider: string | null }> {
  const prompt = `${STIJLINSTRUCTIE}

Schrijf een artikel over: "${onderwerp}" (categorie: ${categorieNaam}).
Geef ALLEEN geldige JSON terug, zonder aanhalingstekens eromheen en zonder markdown-codeblok, exact in dit formaat:
{"titel": "...", "samenvatting": "één zin, max 20 woorden, voor op een kaartje", "inhoud": "de volledige artikeltekst in Markdown met ## voor tussenkopjes, 300 tot 500 woorden"}`;

  const resultaat = await genereerRuweTekst(prompt);
  if (!resultaat) return { concept: null, provider: null };

  const concept = parseJsonUitTekst<ArtikelConcept>(resultaat.tekst);
  if (!concept?.titel || !concept?.samenvatting || !concept?.inhoud) {
    return { concept: null, provider: resultaat.provider };
  }
  return { concept, provider: resultaat.provider };
}

export async function genereerVraagConcept(
  onderwerp: string,
  categorieNaam: string
): Promise<{ concept: VraagConcept | null; provider: string | null }> {
  const prompt = `${STIJLINSTRUCTIE}

Schrijf een vraag-en-antwoord over: "${onderwerp}" (categorie: ${categorieNaam}).
Geef ALLEEN geldige JSON terug, zonder markdown-codeblok, exact in dit formaat:
{"vraag": "de vraag zoals een bezoeker die zou stellen", "antwoordKort": "1-2 zinnen, het korte antwoord voor op de homepage", "antwoord": "het volledige antwoord in Markdown, 150 tot 350 woorden"}`;

  const resultaat = await genereerRuweTekst(prompt);
  if (!resultaat) return { concept: null, provider: null };

  const concept = parseJsonUitTekst<VraagConcept>(resultaat.tekst);
  if (!concept?.vraag || !concept?.antwoordKort || !concept?.antwoord) {
    return { concept: null, provider: resultaat.provider };
  }
  return { concept, provider: resultaat.provider };
}

// Server-side check of er überhaupt een provider is ingesteld — gebruikt om
// de "Genereer concept met AI"-sectie in het formulier te verbergen zolang
// er geen enkele sleutel is ingesteld. Voorkomt een knop die toch niks doet.
export function isAIConfigured(): boolean {
  return Boolean(leesSleutel('GEMINI_API_KEY') || leesSleutel('GROQ_API_KEY') || leesSleutel('OPENROUTER_API_KEY'));
}
