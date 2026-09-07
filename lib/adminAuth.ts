import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE_NAME = 'breinplek_admin_session';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dagen
const SCRYPT_KEYLEN = 64;

// Alles wat nodig is om in te loggen (wachtwoordhash + sessiesleutel) staat in
// dit ene bestand, in een los, schrijfbaar volume. Er hoeft niets handmatig
// aangemaakt te worden: de EERSTE keer dat iemand naar /admin/setup gaat,
// wordt dit bestand aangemaakt. Zodra het bestaat, is /admin/setup niet meer
// bruikbaar (zie isSetupComplete hieronder) en werkt alleen nog /admin/login.
const DATA_DIR = path.join(process.cwd(), 'data');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin.json');

interface AdminCredentials {
  salt: string; // hex
  hash: string; // hex, scrypt(password, salt)
  sessionSecret: string; // hex, willekeurig gegenereerd bij setup
  aangemaaktOp: string;
}

function readCredentials(): AdminCredentials | undefined {
  if (!fs.existsSync(CREDENTIALS_FILE)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8')) as AdminCredentials;
  } catch {
    return undefined;
  }
}

export function isSetupComplete(): boolean {
  return readCredentials() !== undefined;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
}

// Wordt precies één keer aangeroepen, vanuit de setup-actie. Overschrijft
// bewust niets als er al credentials bestaan.
export function completeSetup(password: string): void {
  if (isSetupComplete()) return;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const salt = crypto.randomBytes(16).toString('hex');
  const credentials: AdminCredentials = {
    salt,
    hash: hashPassword(password, salt),
    sessionSecret: crypto.randomBytes(32).toString('hex'),
    aangemaaktOp: new Date().toISOString(),
  };
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
}

export function checkPassword(password: string): boolean {
  const credentials = readCredentials();
  if (!credentials) return false;
  const actual = Buffer.from(hashPassword(password ?? '', credentials.salt), 'hex');
  const expected = Buffer.from(credentials.hash, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

function sign(payload: string): string | undefined {
  const credentials = readCredentials();
  if (!credentials) return undefined;
  return crypto.createHmac('sha256', credentials.sessionSecret).update(payload).digest('hex');
}

export function createSessionCookieValue(): { value: string; maxAgeSeconds: number } {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `admin.${expires}`;
  const signature = sign(payload);
  return { value: `${payload}.${signature ?? ''}`, maxAgeSeconds: SESSION_MAX_AGE_MS / 1000 };
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [scope, expiresStr, signature] = parts;
  const expected = sign(`${scope}.${expiresStr}`);
  if (!expected) return false;
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
  const expires = Number(expiresStr);
  return Number.isFinite(expires) && Date.now() < expires;
}

// Server Component helper: gebruik dit boven aan elke beschermde /admin-pagina.
// Stuurt door naar de eenmalige setup zolang die nog niet is voltooid, anders
// naar de gewone login.
export function requireAdminOrRedirect() {
  if (!isSetupComplete()) {
    redirect('/admin/setup');
  }
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!isValidSessionToken(token)) {
    redirect('/admin/login');
  }
}

// Niet-redirectende check, voor bijvoorbeeld de navigatiebalk.
export function hasValidAdminSession(): boolean {
  if (!isSetupComplete()) return false;
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}
