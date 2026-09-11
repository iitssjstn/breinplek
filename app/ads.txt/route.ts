import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/settings';

// Zonder dit zou Next.js deze route als statisch behandelen en het
// resultaat van de allereerste build (toen er nog geen instellingen
// bestonden) voor altijd blijven serveren.
export const dynamic = 'force-dynamic';

// Genereert /ads.txt dynamisch vanuit dezelfde AdSense-publisher-ID die ook
// AdSlot.tsx en de <script>-tag in app/layout.tsx gebruiken (env var, of via
// /admin/instellingen) — zo blijft dit bestand automatisch synchroon, zonder
// dat de publisher-ID los moet worden bijgehouden op twee plekken.
export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || getSetting('NEXT_PUBLIC_ADSENSE_CLIENT_ID');

  if (!clientId) {
    return new NextResponse('', { headers: { 'Content-Type': 'text/plain' } });
  }

  // AdSense-publisher-ID's zien er in de site-code uit als "ca-pub-XXXX",
  // maar ads.txt verwacht het "pub-XXXX"-formaat (zonder "ca-").
  const pubId = clientId.trim().replace(/^ca-/, '');
  const inhoud = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  return new NextResponse(inhoud, { headers: { 'Content-Type': 'text/plain' } });
}
