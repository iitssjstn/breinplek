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

Je kunt content op drie manieren aanpassen:
1. Via het beheerpaneel op `/admin` (makkelijkst, geen git nodig).
2. Rechtstreeks een `.md`-bestand bewerken en committen.
3. Beide combineren: wat je via `/admin` opslaat, komt gewoon als gewijzigd
   bestand in `content/` terecht — dat kun je dus ook gewoon inchecken.

## Admin-paneel

`/admin` is een met wachtwoord beveiligd beheerpaneel om artikelen en vragen
aan te maken, te bewerken en te verwijderen, zonder dat je Docker of git nodig
hebt. De sessie wordt bijgehouden via een ondertekende, httpOnly cookie
(`lib/adminAuth.ts`) — er zit geen database of extern auth-systeem achter.

Er hoeft niets handmatig aangemaakt te worden. De **eerste** keer dat iemand
naar `/admin` gaat, sturen we door naar `/admin/setup`: daar kies je één keer
een wachtwoord (minimaal 10 tekens). Dat wachtwoord wordt gehasht (scrypt) en
samen met een willekeurig gegenereerde sessiesleutel weggeschreven naar
`data/admin.json`. Zodra dat bestand bestaat:

- is `/admin/setup` niet meer bruikbaar — de pagina stuurt zichzelf door naar
  `/admin/login`;
- werkt inloggen alleen nog met dat ene wachtwoord.

**Belangrijk:** wie er het eerst bij is, mag het wachtwoord instellen. Ga dus
direct na het deployen zelf naar `https://breinplek.nl/admin/setup` voordat je
het domein rondstuurt, zodat niemand anders je voor is. Er is geen manier om
het wachtwoord via de site te resetten — verlies je het, dan verwijder je
`data/admin.json` op de VPS en doorloop je de setup opnieuw.

## Docker

```bash
docker build -t breinplek .
docker run -p 3000:3000 breinplek
```

### Productie (VPS, zelfde opzet als novapers.nl)

1. Repo clonen op de VPS.
2. Zorg dat de container (user-id 1001) in `content/` en `data/` mag
   schrijven: `sudo chown -R 1001:1001 content data` (of ruimer:
   `chmod -R a+rwX content data`).
3. `docker compose up -d`.
4. In Nginx Proxy Manager: `breinplek.nl` → dit host, poort **3010**, SSL aan.
5. Ga meteen zelf naar `https://breinplek.nl/admin/setup` om het
   beheerwachtwoord in te stellen (zie hierboven — wie er eerst is, mag het
   wachtwoord kiezen).

### CI/CD

`.github/workflows/docker-publish.yml` bouwt bij elke push naar `main` de
image en pusht die naar `ghcr.io/iitssjstn/breinplek:latest`. `docker-compose.yml`
pullt dat image; op de VPS is dus geen lokale checkout nodig, alleen
`docker compose pull && docker compose up -d` (of dat automatiseren met
Watchtower / een webhook, zoals bij novapers).
