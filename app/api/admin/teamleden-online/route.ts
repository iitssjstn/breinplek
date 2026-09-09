import { NextResponse } from 'next/server';
import { getSessionUser, onlineGebruikers } from '@/lib/adminAuth';

// Wordt elke 30s gepolld (zelfde interval als novapers.nl). Sluit de
// aanvrager zelf uit -- "teamleden online" gaat over ándere beheerders die
// nu ook actief zijn, niet over jezelf (die zie je toch al door hier te
// kijken).
export async function GET() {
  const gebruiker = getSessionUser();
  if (!gebruiker) {
    return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });
  }
  const anderen = onlineGebruikers().filter(
    (naam) => naam.toLowerCase() !== gebruiker.username.toLowerCase()
  );
  return NextResponse.json({ gebruikers: anderen });
}
