'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  checkPassword,
  completeSetup,
  createSessionCookieValue,
  isSetupComplete,
  requireAdminOrRedirect,
  SESSION_COOKIE_NAME,
} from '@/lib/adminAuth';
import { writeArtikel, deleteArtikelFile, writeVraag, deleteVraagFile } from '@/lib/content';
import { slugify } from '@/lib/slugify';

function startSession() {
  const session = createSessionCookieValue();
  cookies().set(SESSION_COOKIE_NAME, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: session.maxAgeSeconds,
    path: '/',
  });
}

// Eenmalig: maakt het wachtwoord + de sessiesleutel aan. Doet niets als de
// setup al eerder is voltooid (dan is deze pagina toch al niet meer bereikbaar).
export async function setupAction(formData: FormData) {
  if (isSetupComplete()) {
    redirect('/admin/login');
  }

  const password = String(formData.get('password') ?? '');
  const bevestiging = String(formData.get('bevestiging') ?? '');

  if (password.length < 10) {
    redirect('/admin/setup?fout=kort');
  }
  if (password !== bevestiging) {
    redirect('/admin/setup?fout=mismatch');
  }

  completeSetup(password);
  startSession();
  redirect('/admin');
}

export async function loginAction(formData: FormData) {
  if (!isSetupComplete()) {
    redirect('/admin/setup');
  }
  const password = String(formData.get('password') ?? '');
  if (!checkPassword(password)) {
    redirect('/admin/login?fout=1');
  }
  startSession();
  redirect('/admin');
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/admin/login');
}

export async function saveArtikelAction(formData: FormData) {
  requireAdminOrRedirect();

  const oldSlug = (String(formData.get('oldSlug') ?? '') || undefined) as string | undefined;
  const titel = String(formData.get('titel') ?? '').trim();
  const samenvatting = String(formData.get('samenvatting') ?? '').trim();
  const categorie = String(formData.get('categorie') ?? '');
  const datum = String(formData.get('datum') ?? '');
  const inhoud = String(formData.get('inhoud') ?? '');

  const slug = oldSlug ?? slugify(titel);

  writeArtikel(slug, { titel, samenvatting, categorie, datum }, inhoud, oldSlug);

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
  requireAdminOrRedirect();

  const oldSlug = (String(formData.get('oldSlug') ?? '') || undefined) as string | undefined;
  const vraag = String(formData.get('vraag') ?? '').trim();
  const categorie = String(formData.get('categorie') ?? '');
  const antwoordKort = String(formData.get('antwoordKort') ?? '').trim();
  const antwoord = String(formData.get('antwoord') ?? '');

  const slug = oldSlug ?? slugify(vraag);

  writeVraag(slug, { vraag, categorie, antwoordKort }, antwoord, oldSlug);

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
