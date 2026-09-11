'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  checkCredentials,
  completeSetup,
  createSessionCookieValue,
  createUser,
  deleteUser,
  isSetupComplete,
  requireAdminOrRedirect,
  requireAdminRoleOrRedirect,
  SESSION_COOKIE_NAME,
  type Role,
} from '@/lib/adminAuth';
import { writeArtikel, deleteArtikelFile, writeVraag, deleteVraagFile, zetOverigeVragenNietUitgelicht } from '@/lib/content';
import { slugify } from '@/lib/slugify';
import { setSetting } from '@/lib/settings';
import { verwijderUitWachtrij } from '@/lib/wachtrij';

function startSession(username: string) {
  const session = createSessionCookieValue(username);
  cookies().set(SESSION_COOKIE_NAME, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: session.maxAgeSeconds,
    path: '/',
  });
}

// Eenmalig: maakt het eerste account aan (rol admin) + de sessiesleutel. Doet
// niets als de setup al eerder is voltooid (dan is deze pagina toch al niet
// meer bereikbaar).
export async function setupAction(formData: FormData) {
  if (isSetupComplete()) {
    redirect('/admin/login');
  }

  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const bevestiging = String(formData.get('bevestiging') ?? '');

  if (username.length < 2) {
    redirect('/admin/setup?fout=gebruikersnaam');
  }
  if (password.length < 10) {
    redirect('/admin/setup?fout=kort');
  }
  if (password !== bevestiging) {
    redirect('/admin/setup?fout=mismatch');
  }

  completeSetup(username, password);
  startSession(username);
  redirect('/admin');
}

export async function loginAction(formData: FormData) {
  if (!isSetupComplete()) {
    redirect('/admin/setup');
  }
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const user = checkCredentials(username, password);
  if (!user) {
    redirect('/admin/login?fout=1');
  }
  startSession(user.username);
  redirect('/admin');
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/admin/login');
}

// --- Gebruikersbeheer (alleen admins) ---

export async function createUserAction(formData: FormData) {
  requireAdminRoleOrRedirect();

  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const bevestiging = String(formData.get('bevestiging') ?? '');
  const role = (String(formData.get('role') ?? 'redacteur') as Role) === 'admin' ? 'admin' : 'redacteur';

  if (username.length < 2) {
    redirect('/admin/gebruikers?fout=gebruikersnaam');
  }
  if (password.length < 10) {
    redirect('/admin/gebruikers?fout=kort');
  }
  if (password !== bevestiging) {
    redirect('/admin/gebruikers?fout=mismatch');
  }

  const fout = createUser(username, password, role);
  if (fout === 'bestaat-al') {
    redirect('/admin/gebruikers?fout=bestaat-al');
  }

  redirect('/admin/gebruikers');
}

export async function deleteUserAction(formData: FormData) {
  const ingelogdeGebruiker = requireAdminRoleOrRedirect();
  const username = String(formData.get('username') ?? '');

  if (username.trim().toLowerCase() === ingelogdeGebruiker.username.toLowerCase()) {
    redirect('/admin/gebruikers?fout=zelf');
  }

  const fout = deleteUser(username);
  if (fout === 'laatste-admin') {
    redirect('/admin/gebruikers?fout=laatste-admin');
  }

  redirect('/admin/gebruikers');
}

// --- Content ---

export async function saveArtikelAction(formData: FormData) {
  const gebruiker = requireAdminOrRedirect();

  const oldSlug = (String(formData.get('oldSlug') ?? '') || undefined) as string | undefined;
  const titel = String(formData.get('titel') ?? '').trim();
  const samenvatting = String(formData.get('samenvatting') ?? '').trim();
  const categorie = String(formData.get('categorie') ?? '');
  const datum = String(formData.get('datum') ?? '');
  const inhoud = String(formData.get('inhoud') ?? '');
  const bestaandeAuteur = (String(formData.get('auteur') ?? '') || undefined) as string | undefined;

  const slug = oldSlug ?? slugify(titel);

  writeArtikel(
    slug,
    { titel, samenvatting, categorie, datum, auteur: bestaandeAuteur ?? gebruiker.username },
    inhoud,
    oldSlug
  );

  const wachtrijId = String(formData.get('wachtrijId') ?? '');
  if (wachtrijId) verwijderUitWachtrij(wachtrijId);

  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function deleteArtikelAction(formData: FormData) {
  requireAdminOrRedirect();
  const slug = String(formData.get('slug') ?? '');
  if (slug) deleteArtikelFile(slug);
  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function saveVraagAction(formData: FormData) {
  const gebruiker = requireAdminOrRedirect();

  const oldSlug = (String(formData.get('oldSlug') ?? '') || undefined) as string | undefined;
  const vraag = String(formData.get('vraag') ?? '').trim();
  const categorie = String(formData.get('categorie') ?? '');
  const antwoordKort = String(formData.get('antwoordKort') ?? '').trim();
  const antwoord = String(formData.get('antwoord') ?? '');
  const bestaandeAuteur = (String(formData.get('auteur') ?? '') || undefined) as string | undefined;
  const uitgelicht = formData.get('uitgelicht') === 'on';

  const slug = oldSlug ?? slugify(vraag);

  writeVraag(
    slug,
    { vraag, categorie, antwoordKort, auteur: bestaandeAuteur ?? gebruiker.username, uitgelicht },
    antwoord,
    oldSlug
  );
  if (uitgelicht) zetOverigeVragenNietUitgelicht(slug);

  const wachtrijId = String(formData.get('wachtrijId') ?? '');
  if (wachtrijId) verwijderUitWachtrij(wachtrijId);

  revalidatePath('/', 'layout');
  redirect('/admin');
}

export async function deleteVraagAction(formData: FormData) {
  requireAdminOrRedirect();
  const slug = String(formData.get('slug') ?? '');
  if (slug) deleteVraagFile(slug);
  revalidatePath('/', 'layout');
  redirect('/admin');
}

// --- Instellingen (alleen admins) ---

export async function saveInstellingenAction(formData: FormData) {
  requireAdminRoleOrRedirect();

  // Alleen ingevulde velden worden opgeslagen/overschreven. Een leeg veld
  // laat de bestaande waarde ongewijzigd — verwijderen gaat via de losse
  // "Verwijderen"-knop per veld (verwijderInstellingAction), niet door het
  // hele formulier leeg te laten en op te slaan.
  const velden = ['GEMINI_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'NEXT_PUBLIC_ADSENSE_CLIENT_ID'];
  for (const naam of velden) {
    const waarde = formData.get(naam);
    if (typeof waarde === 'string' && waarde.trim()) {
      setSetting(naam, waarde);
    }
  }

  redirect('/admin/instellingen?opgeslagen=1');
}

export async function verwijderInstellingAction(formData: FormData) {
  requireAdminRoleOrRedirect();
  const naam = String(formData.get('naam') ?? '');
  if (naam) setSetting(naam, '');
  redirect('/admin/instellingen?verwijderd=1');
}

// --- Wachtrij (automatisch gegenereerde concepten) ---

export async function afwijzenWachtrijAction(formData: FormData) {
  requireAdminOrRedirect();
  const id = String(formData.get('id') ?? '');
  if (id) verwijderUitWachtrij(id);
  redirect('/admin/wachtrij');
}
