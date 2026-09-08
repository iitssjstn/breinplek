// Instellingen die via het adminpaneel zelf worden ingevoerd (bijv.
// AI-API-sleutels), als alternatief voor environment-variabelen. Wordt
// alleen door admins beheerd, staat in het schrijfbare data-volume.

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'instellingen.json');

type Settings = Record<string, string>;

function readSettings(): Settings {
  if (!fs.existsSync(SETTINGS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) as Settings;
  } catch {
    return {};
  }
}

function writeSettings(data: Settings) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

export function getSetting(key: string): string | undefined {
  const value = readSettings()[key];
  return value || undefined;
}

export function isSettingSet(key: string): boolean {
  return Boolean(getSetting(key));
}

// Lege waarde (leeg formulierveld) verwijdert de instelling.
export function setSetting(key: string, value: string) {
  const data = readSettings();
  if (value.trim()) {
    data[key] = value.trim();
  } else {
    delete data[key];
  }
  writeSettings(data);
}
