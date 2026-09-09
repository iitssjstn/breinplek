'use client';

import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 10_000; // zelfde interval als novapers.nl

export default function LiveBezoekersBadge({ initieelAantal }: { initieelAantal: number }) {
  const [aantal, setAantal] = useState(initieelAantal);

  useEffect(() => {
    async function laad() {
      try {
        const res = await fetch('/api/admin/actieve-bezoekers');
        if (!res.ok) return;
        const data = await res.json();
        setAantal(data.aantal ?? 0);
      } catch {
        // Gemiste poll is geen probleem, de volgende komt er vanzelf aan.
      }
    }
    const interval = setInterval(laad, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber font-heading text-lg font-semibold text-amber">
        {aantal}
      </div>
      <p className="text-center text-xs text-muted">Online nu (site)</p>
    </div>
  );
}
