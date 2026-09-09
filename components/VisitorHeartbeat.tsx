'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const HEARTBEAT_INTERVAL_MS = 15 * 1000;

function getOfMaakBezoekerId(): string {
  // sessionStorage i.p.v. localStorage: het ID verdwijnt zodra het
  // tabblad/venster sluit — er wordt bewust niets bewaard dat een bezoeker
  // over meerdere bezoeken heen zou kunnen herkennen.
  let id = sessionStorage.getItem('breinplek_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('breinplek_visitor_id', id);
  }
  return id;
}

export default function VisitorHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    const visitorId = getOfMaakBezoekerId();

    function stuurHeartbeat() {
      fetch('/api/track-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, pad: pathname }),
      }).catch(() => {
        // Een gemiste heartbeat mag de pagina van de bezoeker niet breken.
      });
    }

    stuurHeartbeat();
    const interval = setInterval(stuurHeartbeat, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
