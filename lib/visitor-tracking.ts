// Zelfde aanpak als novapers.nl: houdt bij welke (volledig anonieme)
// bezoekerssessies de afgelopen tijd actief zijn geweest — puur in het
// geheugen van het draaiende serverproces, niet in een bestand. Dat is
// bewust: dit is vluchtige data die na een herstart toch weer leeg begint,
// en bij mogelijk veel gelijktijdige bezoekers is wegschrijven naar schijf
// bij elke heartbeat onnodig zwaar.
//
// Geen IP-adres, cookie, of andere persoonsgegevens — alleen een
// willekeurig ID (client-side gegenereerd per bezoek) gekoppeld aan een
// paginapad en tijdstip.

interface BezoekerStatus {
  pad: string;
  laatstGezien: number;
}

const laatstGezien = new Map<string, BezoekerStatus>();

const ACTIEF_DREMPEL_MS = 30 * 1000; // 30s zonder heartbeat = niet meer "actief"

export function registreerHeartbeat(visitorId: unknown, pad: unknown) {
  if (typeof visitorId !== 'string' || !visitorId || visitorId.length > 100) return;
  if (typeof pad !== 'string' || !pad || pad.length > 300) return;
  laatstGezien.set(visitorId, { pad, laatstGezien: Date.now() });
}

function opschonen() {
  const grens = Date.now() - ACTIEF_DREMPEL_MS;
  for (const [id, status] of laatstGezien) {
    if (status.laatstGezien < grens) laatstGezien.delete(id);
  }
}

export function getActiefBezoekersAantal(): number {
  opschonen();
  return laatstGezien.size;
}

// Per pagina hoeveel unieke bezoekers er nu actief zijn, hoogste eerst —
// laat zien wélke pagina's nu bekeken worden, niet alleen een totaal.
export function getActievePaginas(): Array<{ pad: string; aantal: number }> {
  opschonen();
  const perPad = new Map<string, number>();
  for (const status of laatstGezien.values()) {
    perPad.set(status.pad, (perPad.get(status.pad) ?? 0) + 1);
  }
  return [...perPad.entries()]
    .map(([pad, aantal]) => ({ pad, aantal }))
    .sort((a, b) => b.aantal - a.aantal);
}
