import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isBotUserAgent } from '@/lib/bot-detection';

// Draait in de Edge-runtime, dus geen fs/crypto hier — het wegschrijven
// gebeurt in /api/analytics/hit (Node-runtime). We sluiten twee dingen uit
// van de statistieken:
// 1. Ingelogde beheerders (best-effort via het sessiecookie — geen
//    waterdichte rolcheck, maar voor een lichte statistiek precies genoeg).
// 2. Bekend bot-/crawlerverkeer (zelfde lijst als novapers.nl), zodat
//    "bezoeken" echt menselijke paginaweergaves betekent.
export function middleware(request: NextRequest) {
  const pad = request.nextUrl.pathname;
  const isAdminSessie = request.cookies.has('breinplek_admin_session');
  const isBot = isBotUserAgent(request.headers.get('user-agent'));
  const isPubliekePagina =
    !pad.startsWith('/admin') && !pad.startsWith('/api') && !pad.startsWith('/_next');

  if (isPubliekePagina && !isAdminSessie && !isBot) {
    fetch(new URL('/api/analytics/hit', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pad }),
    }).catch(() => {
      // Statistieken mogen nooit een paginabezoek breken.
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|admin).*)'],
};
