// Simpele, privacy-vriendelijke bezoekersstatistieken: geen cookies voor
// bezoekers, geen IP-opslag, geen derde partij (geen Google Analytics) — past
// beter bij een site voor een doelgroep die al genoeg te maken heeft met
// systemen die op hen letten. Telt paginapad + aantal + laatst bezocht, plus
// een dagtotaal voor de grafiek op het dashboard. Bezoeken van ingelogde
// beheerders worden er (best-effort) uit gefilterd door middleware.ts.

import fs from 'fs';
import path from 'path';
import { getArtikelBySlug, getVraagBySlug } from './content';
import { getCategory } from './categories';

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const DAGTOTALEN_BEWAAR_DAGEN = 30;

interface PaginaStats {
  aantal: number;
  laatstBezocht: string;
}

interface AnalyticsData {
  paginas: Record<string, PaginaStats>;
  dagtotalen: Record<string, number>; // 'YYYY-MM-DD' -> aantal
}

function leegeData(): AnalyticsData {
  return { paginas: {}, dagtotalen: {} };
}

function readData(): AnalyticsData {
  if (!fs.existsSync(ANALYTICS_FILE)) return leegeData();
  try {
    const ruw = JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
    return {
      paginas: ruw.paginas ?? {},
      dagtotalen: ruw.dagtotalen ?? {},
    };
  } catch {
    return leegeData();
  }
}

function writeData(data: AnalyticsData) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

function vandaagKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function registreerPageview(pad: string) {
  const data = readData();

  const bestaand = data.paginas[pad] ?? { aantal: 0, laatstBezocht: '' };
  data.paginas[pad] = { aantal: bestaand.aantal + 1, laatstBezocht: new Date().toISOString() };

  const dag = vandaagKey();
  data.dagtotalen[dag] = (data.dagtotalen[dag] ?? 0) + 1;

  // Oude dagtotalen opruimen zodat het bestand niet blijft groeien.
  const grensDatum = new Date();
  grensDatum.setDate(grensDatum.getDate() - DAGTOTALEN_BEWAAR_DAGEN);
  for (const dagKey of Object.keys(data.dagtotalen)) {
    if (new Date(dagKey) < grensDatum) delete data.dagtotalen[dagKey];
  }

  writeData(data);
}

// "Nu actief op de site" wordt niet hier bijgehouden (bestandsgebaseerd),
// maar in lib/visitor-tracking.ts — in-memory, zelfde aanpak als
// novapers.nl. Dat is bewust lichter: bij veel gelijktijdige bezoekers zou
// elke heartbeat wegschrijven naar dit bestand onnodig zwaar zijn.

export function topPaginas(limiet = 20): Array<{ pad: string; aantal: number; laatstBezocht: string }> {
  const data = readData();
  return Object.entries(data.paginas)
    .map(([pad, stats]) => ({ pad, ...stats }))
    .sort((a, b) => b.aantal - a.aantal)
    .slice(0, limiet);
}

export function totaalBezoeken(): number {
  const data = readData();
  return Object.values(data.paginas).reduce((som, s) => som + s.aantal, 0);
}

// Dagtotalen voor de laatste N dagen, inclusief dagen zonder bezoek (0),
// zodat de grafiek een vaste, doorlopende tijdlijn heeft.
export function dagtotalenLaatsteDagen(aantalDagen = 14): Array<{ datum: string; aantal: number }> {
  const data = readData();
  const resultaat: Array<{ datum: string; aantal: number }> = [];
  for (let i = aantalDagen - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    resultaat.push({ datum: key, aantal: data.dagtotalen[key] ?? 0 });
  }
  return resultaat;
}

// Bezoeken per categorie, afgeleid uit de paginapaden van artikelen en
// vragen. Overige pagina's (home, over, categorie-overzichten) vallen onder
// "Overig".
export function categorieVerdeling(): Array<{ naam: string; kleur: string; aantal: number }> {
  const data = readData();
  const perCategorie: Record<string, number> = {};
  let overig = 0;

  for (const [pad, stats] of Object.entries(data.paginas)) {
    let categorieSlug: string | undefined;
    if (pad.startsWith('/artikel/')) {
      categorieSlug = getArtikelBySlug(pad.replace('/artikel/', ''))?.categorie;
    } else if (pad.startsWith('/vragen/') && pad !== '/vragen') {
      categorieSlug = getVraagBySlug(pad.replace('/vragen/', ''))?.categorie;
    }

    if (categorieSlug) {
      perCategorie[categorieSlug] = (perCategorie[categorieSlug] ?? 0) + stats.aantal;
    } else {
      overig += stats.aantal;
    }
  }

  const kleuren = ['teal', 'plum', 'amber'];
  const resultaat = Object.entries(perCategorie)
    .map(([slug, aantal], i) => ({
      naam: getCategory(slug)?.naam ?? slug,
      kleur: kleuren[i % kleuren.length],
      aantal,
    }))
    .sort((a, b) => b.aantal - a.aantal);

  if (overig > 0) resultaat.push({ naam: 'Overig', kleur: 'muted', aantal: overig });

  return resultaat;
}
