// Eenvoudige backup/restore van alle content, als één JSON-bestand. Novapers
// heeft hiervoor een apart, GHCR-gedistribueerd backup-receiver-programma
// voor een tweede VPS; dat is voor breinplek's schaal (bestanden, geen
// database) overkill. Eén downloadbaar JSON-bestand met alles erin is
// evenveel bescherming met veel minder onderdelen die kunnen breken.

import { getAllArtikelen, getAllVragen, writeArtikel, writeVraag, type ArtikelRuw, type VraagRuw, getArtikelRawBySlug, getVraagRawBySlug } from './content';

export interface BackupBestand {
  geexporteerdOp: string;
  artikelen: ArtikelRuw[];
  vragen: VraagRuw[];
}

export function maakBackup(): BackupBestand {
  const artikelen = getAllArtikelen().map((a) => getArtikelRawBySlug(a.slug)).filter(Boolean) as ArtikelRuw[];
  const vragen = getAllVragen().map((v) => getVraagRawBySlug(v.slug)).filter(Boolean) as VraagRuw[];
  return {
    geexporteerdOp: new Date().toISOString(),
    artikelen,
    vragen,
  };
}

export function herstelBackup(data: BackupBestand): { artikelen: number; vragen: number } {
  for (const a of data.artikelen ?? []) {
    writeArtikel(
      a.slug,
      { titel: a.titel, samenvatting: a.samenvatting, categorie: a.categorie, datum: a.datum, auteur: a.auteur },
      a.inhoudMarkdown
    );
  }
  for (const v of data.vragen ?? []) {
    writeVraag(
      v.slug,
      { vraag: v.vraag, categorie: v.categorie, antwoordKort: v.antwoordKortMarkdown, auteur: v.auteur },
      v.antwoordMarkdown
    );
  }
  return { artikelen: data.artikelen?.length ?? 0, vragen: data.vragen?.length ?? 0 };
}
