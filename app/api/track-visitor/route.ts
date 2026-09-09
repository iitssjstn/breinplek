import { NextResponse } from 'next/server';
import { registreerHeartbeat } from '@/lib/visitor-tracking';
import { getSessionUser } from '@/lib/adminAuth';
import { isBotUserAgent } from '@/lib/bot-detection';

export async function POST(request: Request) {
  try {
    // Zelfde uitsluiting als bij de paginaweergaves (middleware.ts): een
    // ingelogde beheerder of bekende bot telt niet mee als "actieve
    // bezoeker" — anders lopen "bezoeken" en "nu actief" niet synchroon.
    if (!getSessionUser() && !isBotUserAgent(request.headers.get('user-agent'))) {
      const body = await request.json();
      registreerHeartbeat(body?.visitorId, body?.pad);
    }
  } catch {
    // Een kapotte/ontbrekende body mag de pagina van de bezoeker niet breken.
  }
  return NextResponse.json({ ok: true });
}
