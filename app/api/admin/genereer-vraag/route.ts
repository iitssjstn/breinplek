import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/adminAuth';
import { genereerVraagConcept } from '@/lib/aiProviders';

export async function POST(request: Request) {
  const gebruiker = getSessionUser();
  if (!gebruiker) {
    return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const onderwerp = typeof body?.onderwerp === 'string' ? body.onderwerp.trim() : '';
  const categorieNaam = typeof body?.categorieNaam === 'string' ? body.categorieNaam : '';

  if (!onderwerp) {
    return NextResponse.json({ fout: 'Vul eerst een onderwerp in.' }, { status: 400 });
  }

  const { concept, provider, foutdetail } = await genereerVraagConcept(onderwerp, categorieNaam);
  if (!concept) {
    return NextResponse.json(
      { fout: foutdetail ? `Alle providers mislukten — ${foutdetail}` : 'Geen AI-provider gaf een geldig antwoord.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ...concept, provider });
}
