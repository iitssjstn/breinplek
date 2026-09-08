# breinplek.nl

Praktische tips en vragen &amp; antwoorden over ADHD, autisme en AuDHD. Next.js 14
(App Router), content als Markdown-bestanden, gedeployed als Docker-container —
zelfde methode als novapers.nl.

## Lokaal ontwikkelen

```bash
npm install
npm run dev
```

Open http://localhost:3000 voor de site en http://localhost:3000/admin voor het
beheerpaneel — die stuurt lokaal ook door naar de eenmalige setup (zie
hieronder) en schrijft dan naar `data/admin.json` in je werkmap.

## Content

Artikelen staan als losse `.md`-bestanden in `content/artikelen/`, vragen &amp;
antwoorden in `content/vragen/`. Elk bestand heeft frontmatter (titel/vraag,
categorie, etc.) gevolgd door de tekst in Markdown. Categorieën staan vast in
`lib/categories.ts`.

Je kunt content op twee manieren aanpassen:
1. Via het beheerpaneel op `/admin` (makkelijkst, geen server-toegang nodig).
2. Rechtstreeks in de container: `docker exec -it breinplek sh`, bestanden
   staan op `/app/content`. Handig om snel te kijken, maar wijzigingen die je
   zo maakt staan niet vanzelf ook in git — kopieer ze terug naar je lokale
   checkout als je ze ook in de repo wilt hebben.

## Admin-paneel

`/admin` is een met account beveiligd beheerpaneel om artikelen en vragen aan
te maken, te bewerken en te verwijderen — meerdere mensen, elk met hun eigen
gebruikersnaam en wachtwoord, zoals bij novapers. Er zit geen database achter,
alles staat in `data/users.json` (gehashte wachtwoorden, geen plaintext).

**Rollen:**
- **Admin** — alles wat een redacteur kan, plus accounts aanmaken/verwijderen
  via `/admin/gebruikers`.
- **Redacteur** — artikelen en vragen aanmaken, bewerken, verwijderen. Geen
  toegang tot gebruikersbeheer.

Er hoeft niets handmatig aangemaakt te worden. De **eerste** keer dat iemand
naar `/admin` gaat, sturen we door naar `/admin/setup`: daar kies je een
gebruikersnaam en wachtwoord (minimaal 10 tekens) voor het eerste account —
dat wordt automatisch admin. Zodra dat account bestaat:

- is `/admin/setup` niet meer bruikbaar — de pagina stuurt zichzelf door naar
  `/admin/login`;
- voeg je extra accounts toe via `/admin/gebruikers` (alleen zichtbaar voor
  admins).

Elk artikel/vraag onthoudt wie het als eerste heeft aangemaakt (`auteur` in de
frontmatter, zichtbaar in het dashboard en bovenaan het bewerkformulier).

**Belangrijk:** wie er het eerst bij is, mag het eerste (admin-)account
aanmaken. Ga dus direct na het deployen zelf naar
`https://breinplek.nl/admin/setup` voordat je het domein rondstuurt. Er is
geen "wachtwoord vergeten"-optie — raak je als enige admin je wachtwoord
kwijt, dan verwijder en herstart je het `breinplek_data`-volume op de VPS
(`docker compose down`, `docker volume rm breinplek_data`,
`docker compose up -d`) en doorloop je de setup opnieuw. Dat verwijdert dan
wel alle accounts.

## AI-conceptgenerator (optioneel)

Op de "nieuw artikel" en "nieuwe vraag"-pagina's staat een knop om een
concept te laten schrijven door een AI-model, in de toon van breinplek —
net als novapers, met dezelfde fallback-volgorde over meerdere providers
(Gemini -> Groq -> OpenRouter). Zonder API-sleutels doet de knop niets
(nette foutmelding, geen crash); je kiest zelf welke providers je gebruikt.

Zet één of meer van deze environment-variabelen (of, voor wie geen
plaintext secrets in `docker-compose.yml` wil: `<NAAM>_FILE` met het pad
naar een bestand met de sleutel erin, zelfde patroon als Docker secrets):

- `GEMINI_API_KEY` (of `GEMINI_API_KEY_FILE`)
- `GROQ_API_KEY` (of `GROQ_API_KEY_FILE`)
- `OPENROUTER_API_KEY` (of `OPENROUTER_API_KEY_FILE`)

Gegenereerde tekst wordt altijd eerst getoond in het formulier, nooit
automatisch opgeslagen — je controleert en bewerkt zelf voor je op
"Opslaan" drukt.

## Advertenties (optioneel)

Zelfde opzet als novapers (Google AdSense), standaard uit. Zet
`NEXT_PUBLIC_ADSENSE_CLIENT_ID` (je publisher-ID, bijv. `ca-pub-...`) om het
AdSense-script te laden en advertentieblokken te tonen. Bewust terughoudend
geplaatst (nu alleen onderaan een artikel) — deze doelgroep heeft baat bij
minder visuele ruis, niet meer.

## Backup

`/admin/backup` (alleen admins): downloadt alle artikelen en vragen als één
JSON-bestand, en kan zo'n bestand ook weer terugzetten. Simpeler dan
novapers' aparte backup-receiver-app voor een tweede VPS, maar dekt
dezelfde behoefte — bewaar 'm gewoon af en toe ergens los.

## Statistieken

`/admin/statistieken`: lichte, zelf gehoste bezoekersstatistieken per
pagina — geen cookies bij bezoekers, geen Google Analytics. Bezoeken van
ingelogde beheerders worden er (best-effort, via het sessiecookie) uit
gefilterd.

## Docker

```bash
docker build -t breinplek .
docker run -p 3000:3000 breinplek
```

### Productie (VPS, zelfde opzet als novapers.nl)

Er is geen lokale git-checkout nodig — alleen `docker-compose.yml` hoeft op de
VPS te staan (bijvoorbeeld in `/opt/breinplek/docker-compose.yml`).

1. `docker-compose.yml` op de VPS zetten.
2. `docker compose up -d --build`. Dit bouwt de image rechtstreeks vanaf de
   GitHub-repo; `breinplek_content` en `breinplek_data` worden als nieuwe,
   lege named volumes automatisch gevuld met wat er in de image staat (dus
   content meteen aanwezig, data leeg — klaar voor de setup hieronder).
3. In Nginx Proxy Manager: `breinplek.nl` → dit host, poort **3010**, SSL aan.
4. Ga meteen zelf naar `https://breinplek.nl/admin/setup` om het
   beheerwachtwoord in te stellen (zie hierboven — wie er eerst is, mag het
   wachtwoord kiezen).

### Nieuwe versie uitrollen

Zelfde commando als bij novapers, alleen de servicenaam verschilt. Ga ervan
uit dat het `breinplek`-serviceblok in dezelfde gedeelde `docker-compose.yml`
staat als je andere sites (bijv. `~/npm/docker-compose.yml`, naast
`ai-nieuwssite`):

```bash
cd ~/npm
docker compose build --no-cache breinplek
docker compose up -d
docker system prune -f
```

`--no-cache` is nodig omdat de build-context een git-URL is: zonder die vlag
kan Docker een oudere, gecachete versie van de repo hergebruiken in plaats van
de laatste commit op te halen. `breinplek_content` en `breinplek_data` blijven
gewoon bestaan tussen builds in — alleen de applicatiecode wordt vervangen.
`docker system prune -f` ruimt de oude, ongebruikte image-lagen op.
