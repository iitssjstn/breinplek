import { requireAdminRoleOrRedirect } from '@/lib/adminAuth';
import { isSettingSet } from '@/lib/settings';
import { saveInstellingenAction, verwijderInstellingAction } from '@/app/admin/actions';

export const metadata = { title: 'Instellingen' };

interface VeldDef {
  naam: string;
  label: string;
  uitleg: string;
  isWachtwoordveld?: boolean;
}

const VELDEN: VeldDef[] = [
  {
    naam: 'GEMINI_API_KEY',
    label: 'Gemini API-sleutel',
    uitleg: 'Voor de AI-conceptgenerator, eerste keuze.',
    isWachtwoordveld: true,
  },
  {
    naam: 'GROQ_API_KEY',
    label: 'Groq API-sleutel',
    uitleg: 'Voor de AI-conceptgenerator, gebruikt als Gemini niet is ingesteld of niet reageert.',
    isWachtwoordveld: true,
  },
  {
    naam: 'OPENROUTER_API_KEY',
    label: 'OpenRouter API-sleutel',
    uitleg: 'Voor de AI-conceptgenerator, laatste terugval-optie.',
    isWachtwoordveld: true,
  },
  {
    naam: 'NEXT_PUBLIC_ADSENSE_CLIENT_ID',
    label: 'AdSense publisher-ID',
    uitleg: 'Bijv. ca-pub-1234567890. Niet ingesteld = geen advertenties op de site.',
  },
];

export default function InstellingenPage({
  searchParams,
}: {
  searchParams: { opgeslagen?: string; verwijderd?: string };
}) {
  requireAdminRoleOrRedirect();

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-semibold text-ink">Instellingen</h1>
      <p className="mt-2 text-muted">
        API-sleutels voor de AI-conceptgenerator en de advertentie-ID, rechtstreeks vanuit het
        adminpaneel — je hoeft hier niets voor in Docker of environment-variabelen te zetten.
        Een environment-variabele met dezelfde naam (bijv. in docker-compose) heeft altijd
        voorrang boven wat je hier invoert.
      </p>

      {searchParams?.opgeslagen === '1' && (
        <p className="mt-4 rounded-md border border-teal bg-teal-light px-4 py-3 text-sm text-teal-dark">
          Opgeslagen.
        </p>
      )}
      {searchParams?.verwijderd === '1' && (
        <p className="mt-4 rounded-md border border-teal bg-teal-light px-4 py-3 text-sm text-teal-dark">
          Verwijderd.
        </p>
      )}

      <form action={saveInstellingenAction} className="mt-6 flex flex-col gap-5">
        {VELDEN.map((veld) => (
          <div key={veld.naam} className="flex flex-col gap-1.5">
            <label htmlFor={veld.naam} className="text-sm font-medium text-ink">
              {veld.label}
            </label>
            <input
              id={veld.naam}
              type={veld.isWachtwoordveld ? 'password' : 'text'}
              name={veld.naam}
              placeholder={isSettingSet(veld.naam) ? '•••••••• (ingesteld — laat leeg om ongewijzigd te laten)' : ''}
              className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-teal"
            />
            <span className="text-xs text-muted">{veld.uitleg}</span>
            {isSettingSet(veld.naam) && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-teal">✓ Ingesteld via dit paneel</span>
                <form action={verwijderInstellingAction}>
                  <input type="hidden" name="naam" value={veld.naam} />
                  <button type="submit" className="text-amber-dark hover:underline">
                    Verwijderen
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}

        <p className="text-xs text-muted">
          Alleen ingevulde velden worden opgeslagen — een leeg veld laat een bestaande waarde
          ongewijzigd. Gebruik de losse &quot;Verwijderen&quot;-knop om een sleutel echt te wissen.
        </p>

        <div>
          <button
            type="submit"
            className="rounded-md bg-teal px-5 py-2.5 font-medium text-white hover:bg-teal-dark"
          >
            Opslaan
          </button>
        </div>
      </form>
    </div>
  );
}
