import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/adminAuth';
import { maakBackup, herstelBackup, type BackupBestand } from '@/lib/backup';
import { revalidatePath } from 'next/cache';

function requireAdminJson() {
  const gebruiker = getSessionUser();
  if (!gebruiker) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });
  if (gebruiker.role !== 'admin') {
    return NextResponse.json({ fout: 'Alleen admins mogen dit.' }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const foutResponse = requireAdminJson();
  if (foutResponse) return foutResponse;

  const backup = maakBackup();
  const datum = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="breinplek-backup-${datum}.json"`,
    },
  });
}

export async function POST(request: Request) {
  const foutResponse = requireAdminJson();
  if (foutResponse) return foutResponse;

  const data = (await request.json().catch(() => null)) as BackupBestand | null;
  if (!data || !Array.isArray(data.artikelen) || !Array.isArray(data.vragen)) {
    return NextResponse.json({ fout: 'Ongeldig backup-bestand.' }, { status: 400 });
  }

  const resultaat = herstelBackup(data);
  revalidatePath('/', 'layout');
  return NextResponse.json(resultaat);
}
