'use client';

import { useEffect, useState } from 'react';

const POLL_INTERVAL_MS = 30_000; // zelfde interval als novapers.nl

export default function LiveTeamledenActief({ initieel }: { initieel: string[] }) {
  const [namen, setNamen] = useState(initieel);

  useEffect(() => {
    async function laad() {
      try {
        const res = await fetch('/api/admin/teamleden-online');
        if (!res.ok) return;
        const data = await res.json();
        setNamen(data.gebruikers ?? []);
      } catch {
        // Gemiste poll is geen probleem, de volgende komt er vanzelf aan.
      }
    }
    const interval = setInterval(laad, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (namen.length === 0) return null;

  return (
    <div className="border-t border-line px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Teamleden actief</p>
      <ul className="mt-2 space-y-1">
        {namen.map((naam) => (
          <li key={naam} className="flex items-center gap-2 text-sm text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
            {naam}
          </li>
        ))}
      </ul>
    </div>
  );
}
