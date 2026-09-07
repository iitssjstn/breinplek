import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE_NAME = 'breinplek_admin_session';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dagen
const SCRYPT_KEYLEN = 64;

// Alle accounts staan in dit ene bestand, in een los, schrijfbaar volume.
// Er hoeft niets handmatig aangemaakt te worden: de EERSTE keer dat iemand
// naar /admin/setup gaat, maakt diegene het eerste account (automatisch rol
// "admin") en wordt dit bestand aangemaakt. Zodra er minstens één gebruiker
// bestaat, is /admin/setup niet meer bruikbaar — nieuwe accounts komen er dan
// alleen nog bij via /admin/gebruikers (alleen voor admins).
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSION_SECRET_FILE = path.join(DATA_DIR, 'session-secret.json');

export type Role = 'admin' | 'redacteur';

export interface AdminUser {
  username: string;
  salt: string; // hex
  hash: string; // hex, scrypt(password, salt)
  role: Role;
  aangemaaktOp: string;
}

export interface SessionUser {
  username: string;
  role: Role;
}

function readUsers(): AdminUser[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) as AdminUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: AdminUser[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), { mode: 0o600 });
}

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

function findUser(username: string): AdminUser | undefined {
  const target = normalizeUsername(username);
  return readUsers().find((u) => normalizeUsername(u.username) === target);
}

export function isSetupComplete(): boolean {
  return readUsers().length > 0;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
}

function getSessionSecret(): string | undefined {
  if (!fs.existsSync(SESSION_SECRET_FILE)) return undefined;
  try {
    return (JSON.parse(fs.readFileSync(SESSION_SECRET_FILE, 'utf8')) as { secret: string }).secret;
  } catch {
    return undefined;
  }
}

function ensureSessionSecret(): string {
  const existing = getSessionSecret();
  if (existing) return existing;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SESSION_SECRET_FILE, JSON.stringify({ secret }, null, 2), { mode: 0o600 });
  return secret;
}

// Wordt precies één keer aangeroepen, vanuit de setup-actie. Maakt het eerste
// account (rol "admin") en de sessiesleutel aan. Doet niets als er al een
// gebruiker bestaat.
export function completeSetup(username: string, password: string): void {
  if (isSetupComplete()) return;
  ensureSessionSecret();
  const salt = crypto.randomBytes(16).toString('hex');
  writeUsers([
    {
      username: username.trim(),
      salt,
      hash: hashPassword(password, salt),
      role: 'admin',
      aangemaaktOp: new Date().toISOString(),
    },
  ]);
}

export type CreateUserError = 'bestaat-al' | null;

export function createUser(username: string, password: string, role: Role): CreateUserError {
  const users = readUsers();
  if (findUser(username)) return 'bestaat-al';
  const salt = crypto.randomBytes(16).toString('hex');
  users.push({
    username: username.trim(),
    salt,
    hash: hashPassword(password, salt),
    role,
    aangemaaktOp: new Date().toISOString(),
  });
  writeUsers(users);
  return null;
}

export function listUsers(): AdminUser[] {
  return readUsers();
}

export function countAdmins(): number {
  return readUsers().filter((u) => u.role === 'admin').length;
}

// Voorkomt dat de laatste admin zichzelf (of iemand anders) wegklikt en
// iedereen buitensluit.
export function deleteUser(username: string): 'laatste-admin' | 'niet-gevonden' | null {
  const users = readUsers();
  const target = findUser(username);
  if (!target) return 'niet-gevonden';
  if (target.role === 'admin' && countAdmins() <= 1) return 'laatste-admin';
  writeUsers(users.filter((u) => normalizeUsername(u.username) !== normalizeUsername(username)));
  return null;
}

export function checkCredentials(username: string, password: string): AdminUser | undefined {
  const user = findUser(username);
  if (!user) return undefined;
  const actual = Buffer.from(hashPassword(password ?? '', user.salt), 'hex');
  const expected = Buffer.from(user.hash, 'hex');
  if (actual.length !== expected.length) return undefined;
  return crypto.timingSafeEqual(actual, expected) ? user : undefined;
}

function sign(payload: string): string | undefined {
  const secret = getSessionSecret();
  if (!secret) return undefined;
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createSessionCookieValue(username: string): { value: string; maxAgeSeconds: number } {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = Buffer.from(JSON.stringify({ u: username, exp: expires })).toString('base64url');
  const signature = sign(payload);
  return { value: `${payload}.${signature ?? ''}`, maxAgeSeconds: SESSION_MAX_AGE_MS / 1000 };
}

function readSessionCookieUser(token: string | undefined): SessionUser | undefined {
  if (!token) return undefined;
  const parts = token.split('.');
  if (parts.length !== 2) return undefined;
  const [payload, signature] = parts;
  const expected = sign(payload);
  if (!expected) return undefined;
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return undefined;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return undefined;

  let decoded: { u?: string; exp?: number };
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return undefined;
  }
  if (!decoded.u || !decoded.exp || Date.now() >= decoded.exp) return undefined;

  // Rol altijd vers uit users.json halen (niet uit de cookie): zo werkt een
  // rolwijziging of het verwijderen van het account direct door, zonder dat
  // een oud, nog geldig cookie stiekem toegang blijft geven.
  const user = findUser(decoded.u);
  if (!user) return undefined;
  return { username: user.username, role: user.role };
}

// Server Component helper: gebruik dit boven aan elke beschermde /admin-pagina.
// Stuurt door naar de eenmalige setup zolang die nog niet is voltooid, anders
// naar de gewone login. Geeft de ingelogde gebruiker terug.
export function requireAdminOrRedirect(): SessionUser {
  if (!isSetupComplete()) {
    redirect('/admin/setup');
  }
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const user = readSessionCookieUser(token);
  if (!user) {
    redirect('/admin/login');
  }
  return user;
}

// Zoals requireAdminOrRedirect, maar stuurt niet-admins terug naar het
// dashboard. Gebruik dit boven aan /admin/gebruikers.
export function requireAdminRoleOrRedirect(): SessionUser {
  const user = requireAdminOrRedirect();
  if (user.role !== 'admin') {
    redirect('/admin');
  }
  return user;
}

// Niet-redirectende check, voor bijvoorbeeld de navigatiebalk.
export function getSessionUser(): SessionUser | undefined {
  if (!isSetupComplete()) return undefined;
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return readSessionCookieUser(token);
}
