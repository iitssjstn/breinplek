import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/adminAuth';
import { getActiefBezoekersAantal } from '@/lib/visitor-tracking';

// Wordt elke 10s gepolld door de admin-dashboardpagina (zelfde interval als
// novapers.nl) zodat "Online nu (site)" live meebeweegt zonder dat je de
// pagina hoeft te herladen. Geeft bewust alleen een totaalaantal terug, geen
// paginapaden — welke specifieke pagina een bezoeker bekijkt, tonen we niet.
export async function GET() {
  if (!getSessionUser()) {
    return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });
  }
  return NextResponse.json({ aantal: getActiefBezoekersAantal() });
}
