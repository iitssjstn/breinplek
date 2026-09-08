'use client';


import { useState } from 'react';

export default function BackupClient() {
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function herstelBestand(bestand: File) {
    setBezig(true);
    setFout(null);
    setMelding(null);
    try {
      const tekst = await bestand.text();
      const data = JSON.parse(tekst);
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resultaat = await res.json();
      if (!res.ok) {
        setFout(resultaat.fout ?? 'Herstellen is mislukt.');
        return;
      }
      setMelding(
        `Hersteld: ${resultaat.artikelen} artikelen en ${resultaat.vragen} vragen. Herlaad het dashboard om de wijzigingen te zien.`
      );
    } catch {
      setFout('Kon het bestand niet lezen — is het een geldige backup.json?');
    } finally {
      setBezig(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Backup</h1>
      <p className="mt-2 max-w-prose text-muted">
        Eén JSON-bestand met alle artikelen en vragen, inclusief auteur. Handig om regelmatig
        te downloaden en apart te bewaren, los van de VPS.
      </p>

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-ink">Downloaden</h2>
        <a
          href="/api/admin/backup"
          className="mt-3 inline-block rounded-md bg-teal px-5 py-2.5 font-medium text-white hover:bg-teal-dark"
        >
          Backup downloaden
        </a>
      </section>

      <section className="mt-10 max-w-lg">
        <h2 className="font-heading text-lg font-semibold text-ink">Herstellen</h2>
        <p className="mt-1 text-sm text-muted">
          Let op: bestaande artikelen/vragen met dezelfde URL (slug) worden overschreven.
          Nieuwe komen erbij. Er wordt niets verwijderd.
        </p>
        <input
          type="file"
          accept="application/json"
          disabled={bezig}
          onChange={(e) => {
            const bestand = e.target.files?.[0];
            if (bestand) herstelBestand(bestand);
          }}
          className="mt-3 block text-sm text-ink"
        />
        {bezig && <p className="mt-2 text-sm text-muted">Bezig met herstellen...</p>}
        {melding && (
          <p className="mt-2 rounded-md border border-teal/30 bg-teal-light px-4 py-3 text-sm text-teal-dark">
            {melding}
          </p>
        )}
        {fout && (
          <p className="mt-2 rounded-md border border-amber-dark/30 bg-amber-light px-4 py-3 text-sm text-amber-dark">
            {fout}
          </p>
        )}
      </section>
    </div>
  );
}
