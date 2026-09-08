// Advertentieblok, zelfde opzet als novapers (Google AdSense). Toont niets
// als er geen publisher-ID is ingesteld — advertenties zijn dus optioneel en
// standaard uit. Bewust terughoudend geplaatst (niet tussen elke paar
// alinea's): deze doelgroep heeft juist minder visuele ruis nodig, niet meer.
export default function AdSlot({ slotId }: { slotId: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!client) return null;

  return (
    <div className="my-8 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: '680px' }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
