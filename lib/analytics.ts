// Simpele, privacy-vriendelijke bezoekersstatistieken: geen cookies voor
// bezoekers, geen IP-opslag, geen derde partij (geen Google Analytics) — past
// beter bij een site voor een doelgroep die al genoeg te maken heeft met
// systemen die op hen letten. Telt alleen paginapad + aantal + laatst
// bezocht. Bezoeken van ingelogde beheerders worden er (best-effort) uit
// gefilterd door middleware.ts.

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

interface PaginaStats {
  aantal: number;
  laatstBezocht: string;
}

type AnalyticsData = Record<string, PaginaStats>;

function readData(): AnalyticsData {
  if (!fs.existsSync(ANALYTICS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8')) as AnalyticsData;
  } catch {
    return {};
  }
}

function writeData(data: AnalyticsData) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

export function registreerPageview(pad: string) {
  const data = readData();
  const bestaand = data[pad] ?? { aantal: 0, laatstBezocht: '' };
  data[pad] = { aantal: bestaand.aantal + 1, laatstBezocht: new Date().toISOString() };
  writeData(data);
}

export function topPaginas(limiet = 20): Array<{ pad: string; aantal: number; laatstBezocht: string }> {
  const data = readData();
  return Object.entries(data)
    .map(([pad, stats]) => ({ pad, ...stats }))
    .sort((a, b) => b.aantal - a.aantal)
    .slice(0, limiet);
}

export function totaalBezoeken(): number {
  const data = readData();
  return Object.values(data).reduce((som, s) => som + s.aantal, 0);
}
