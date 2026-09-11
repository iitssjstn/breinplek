// Vaste, roulerende lijst met ADHD/autisme/AuDHD-onderwerpen voor de
// dagelijkse automatische conceptgenerator (scripts/dagelijkse-generator.mjs).
// Novapers.nl haalt onderwerpen uit RSS-nieuwsbronnen; die heeft breinplek
// niet, dus dit is het alternatief: een handmatig samengestelde lijst i.p.v.
// automatisch binnengehaalde nieuwsitems.
//
// BELANGRIJK: dit bestand wordt gebruikt door de Next.js-app (TypeScript).
// scripts/dagelijkse-generator.mjs draait als los, ongecompileerd
// Node-script en heeft daarom een eigen, identieke kopie van deze lijst in
// gewoon JavaScript. Voeg je hier een onderwerp toe, doe dat dan ook daar.

import type { CategorySlug } from './categories';

export interface Onderwerp {
  onderwerp: string;
  categorie: CategorySlug;
}

export const ONDERWERPEN: Onderwerp[] = [
  { onderwerp: 'Hyperfocus: wanneer het helpt en wanneer het in de weg zit', categorie: 'adhd' },
  { onderwerp: 'Emotieregulatie en ADHD: waarom kleine dingen soms groot aanvoelen', categorie: 'adhd' },
  { onderwerp: 'ADHD en slaap: waarom afschakelen zo moeilijk is', categorie: 'adhd' },
  { onderwerp: 'Impulsief uitgeven: geld en ADHD', categorie: 'adhd' },
  { onderwerp: 'Waarom multitasken met ADHD vaak averechts werkt', categorie: 'adhd' },
  { onderwerp: 'ADHD op het werk: omgaan met open kantoren en afleiding', categorie: 'adhd' },

  { onderwerp: 'Verandering van routine: waarom kleine aanpassingen soms grote impact hebben', categorie: 'autisme' },
  { onderwerp: 'Sociale scripts: waarom ze helpen en waar de grens ligt', categorie: 'autisme' },
  { onderwerp: "Sensorische voorkeuren in kleding en waarom comfort niet 'kinderachtig' is", categorie: 'autisme' },
  { onderwerp: 'Autisme en vriendschappen: kwaliteit boven kwantiteit', categorie: 'autisme' },
  { onderwerp: 'Special interests: waarom een obsessie ook rust kan geven', categorie: 'autisme' },
  { onderwerp: 'Autisme herkennen op latere leeftijd: laat gediagnosticeerd, niet te laat', categorie: 'autisme' },

  { onderwerp: 'Waarom AuDHD vaak later herkend wordt dan ADHD of autisme alleen', categorie: 'audhd' },
  { onderwerp: 'Structuur zoeken én structuur ontvluchten: de innerlijke tegenstelling van AuDHD', categorie: 'audhd' },
  { onderwerp: 'AuDHD en burn-out: dubbele belasting, dubbel herstel nodig', categorie: 'audhd' },
  { onderwerp: "Waarom 'gewoon een planning maken' niet werkt bij AuDHD", categorie: 'audhd' },
  { onderwerp: 'AuDHD en sociale energie: het ene moment behoefte aan mensen, het andere aan stilte', categorie: 'audhd' },
  { onderwerp: 'Medicatie en AuDHD: waarom het proces vaak anders verloopt dan bij ADHD alleen', categorie: 'audhd' },

  { onderwerp: 'Solliciteren met ADHD of autisme: wat je wel en niet moet delen', categorie: 'werk-school' },
  { onderwerp: "Examens en ADHD: strategieën die verder gaan dan 'gewoon leren'", categorie: 'werk-school' },
  { onderwerp: 'Feedback ontvangen als je snel overweldigd raakt', categorie: 'werk-school' },
  { onderwerp: 'Thuiswerken met ADHD: structuur zonder toezicht', categorie: 'werk-school' },
  { onderwerp: 'Functioneringsgesprekken voorbereiden als je moeite hebt met terugkijken', categorie: 'werk-school' },

  { onderwerp: 'Boodschappen doen zonder overprikkeld te raken', categorie: 'dagelijks-leven' },
  { onderwerp: "Administratie bijhouden als 'even een half uurtje' niet bestaat", categorie: 'dagelijks-leven' },
  { onderwerp: 'Verjaardagen en sociale verplichtingen plannen zonder uitputting', categorie: 'dagelijks-leven' },
  { onderwerp: 'Koken voor één: waarom variatie soms juist te veel is', categorie: 'dagelijks-leven' },
  { onderwerp: 'Wat te doen als de was zich opstapelt: kleine systemen die echt werken', categorie: 'dagelijks-leven' },
];
