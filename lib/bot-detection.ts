// Zelfde lijst en aanpak als novapers.nl: sluit bekend bot-/crawlerverkeer
// uit van de bezoekersstatistieken, zodat "bezoeken" echt menselijke
// paginaweergaves betekent, niet scanverkeer.
//
// Drie categorieën, elk met een eigen reden om uit te sluiten:
// 1. Zoekmachine-crawlers (Googlebot, Bingbot, ...) — bezoeken elk artikel
//    routinematig.
// 2. Social-media/chat-linkpreviews (Slackbot, Twitterbot, ...) — halen de
//    pagina server-side op voor de preview-kaart zodra een link gedeeld
//    wordt, zonder dat er ooit een mens meekijkt.
// 3. SEO-/monitoring-tools en generieke scripts (AhrefsBot, UptimeRobot,
//    curl, ...) — professioneel scanverkeer, geen lezers.
const BOT_PATTERNS = [
  // Zoekmachines
  /googlebot/i, /bingbot/i, /baiduspider/i, /yandexbot/i, /duckduckbot/i,
  /slurp/i, /applebot/i, /petalbot/i, /sogou/i, /exabot/i,
  // Social/chat linkpreviews
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /slackbot/i,
  /discordbot/i, /telegrambot/i, /whatsapp/i, /pinterest/i, /redditbot/i,
  /skypeuripreview/i, /vkshare/i, /embedly/i,
  // SEO-/monitoring-tools
  /ahrefsbot/i, /semrushbot/i, /mj12bot/i, /dotbot/i, /uptimerobot/i,
  /pingdom/i, /statuscake/i, /gtmetrix/i, /screaming\s?frog/i,
  // Generieke bot-/scriptsignalen
  /bot\b/i, /crawler/i, /spider/i, /headlesschrome/i, /phantomjs/i,
  /curl\//i, /wget\//i, /python-requests/i, /axios\//i, /go-http-client/i,
  /scrapy/i,
];

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? '').trim();
  if (!ua) return true; // Vrijwel elke echte browser stuurt een User-Agent; ontbreken is zelf al verdacht.
  return BOT_PATTERNS.some((pattern) => pattern.test(ua));
}
