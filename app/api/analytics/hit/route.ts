import { NextResponse } from 'next/server';
import { registreerPageview } from '@/lib/analytics';

// Node-runtime route (fs toegestaan) die middleware.ts (Edge-runtime, geen
// fs) aanroept om een pageview weg te schrijven.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pad = typeof body?.pad === 'string' ? body.pad : null;
  if (pad) registreerPageview(pad);
  return NextResponse.json({ ok: true });
}
