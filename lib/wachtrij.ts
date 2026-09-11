// Concept-wachtrij voor automatisch gegenereerde content — zelfde idee als
// novapers.nl's review-wachtrij: de dagelijkse generator (zie
// scripts/dagelijkse-generator.mjs) zet hier concepten neer, maar niets
// wordt gepubliceerd zonder dat een beheerder het hier heeft bekeken en
// op "Publiceren" heeft gedrukt.

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { CategorySlug } from './categories';

const DATA_DIR = path.join(process.cwd(), 'data');
const WACHTRIJ_FILE = path.join(DATA_DIR, 'wachtrij.json');

export interface WachtrijItem {
  id: string;
  soort: 'artikel' | 'vraag';
  onderwerp: string;
  categorie: CategorySlug;
  provider: string;
  aangemaaktOp: string;
  // artikel
  titel?: string;
  samenvatting?: string;
  inhoud?: string;
  // vraag
  vraag?: string;
  antwoordKort?: string;
  antwoord?: string;
}

function lees(): WachtrijItem[] {
  if (!fs.existsSync(WACHTRIJ_FILE)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(WACHTRIJ_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function schrijf(items: WachtrijItem[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(WACHTRIJ_FILE, JSON.stringify(items, null, 2));
}

export function getWachtrij(): WachtrijItem[] {
  return lees().sort((a, b) => (a.aangemaaktOp < b.aangemaaktOp ? 1 : -1));
}

export function getWachtrijItem(id: string): WachtrijItem | undefined {
  return lees().find((item) => item.id === id);
}

export function voegToeAanWachtrij(item: Omit<WachtrijItem, 'id' | 'aangemaaktOp'>): WachtrijItem {
  const nieuw: WachtrijItem = { ...item, id: crypto.randomUUID(), aangemaaktOp: new Date().toISOString() };
  const items = lees();
  items.push(nieuw);
  schrijf(items);
  return nieuw;
}

export function verwijderUitWachtrij(id: string) {
  schrijf(lees().filter((item) => item.id !== id));
}
