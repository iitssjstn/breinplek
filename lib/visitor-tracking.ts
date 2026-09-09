// Zelfde aanpak als novapers.nl: houdt bij hoeveel (volledig anonieme)
// bezoekerssessies de afgelopen tijd actief zijn geweest — puur in het
// geheugen van het draaiende serverproces, niet in een bestand. Dat is
// bewust: dit is vluchtige data die na een herstart toch weer leeg begint,
// en bij mogelijk veel gelijktijdige bezoekers is wegschrijven naar schijf
// bij elke heartbeat onnodig zwaar.
//
// Geen IP-adres, cookie, of andere persoonsgegevens — alleen een
// willekeurig ID (client-side gegenereerd per bezoek) gekoppeld aan een
// tijdstip. Er wordt bewust niet bijgehouden óp welke pagina iemand zit,
// alleen dát iemand actief is: een totaalaantal, geen paginaoverzicht.

const laatstGezien = new Map<string, number>();

const ACTIEF_DREMPEL_MS = 30 * 1000; // 30s zonder heartbeat = niet meer "actief"

export function registreerHeartbeat(visitorId: unknown) {
  if (typeof visitorId !== 'string' || !visitorId || visitorId.length > 100) return;
  laatstGezien.set(visitorId, Date.now());
}

function opschonen() {
  const grens = Date.now() - ACTIEF_DREMPEL_MS;
  for (const [id, tijdstip] of laatstGezien) {
    if (tijdstip < grens) laatstGezien.delete(id);
  }
}

export function getActiefBezoekersAantal(): number {
  opschonen();
  return laatstGezien.size;
}
