import { redirect } from 'next/navigation';
import { isSetupComplete } from '@/lib/adminAuth';
import { setupAction } from '@/app/admin/actions';

export const metadata = { title: 'Eerste keer instellen' };

const foutmeldingen: Record<string, string> = {
  gebruikersnaam: 'Kies een gebruikersnaam van minstens 2 tekens.',
  kort: 'Kies een wachtwoord van minstens 10 tekens.',
  mismatch: 'De twee wachtwoorden komen niet overeen.',
};

export default function AdminSetupPage({ searchParams }: { searchParams: { fout?: string } }) {
  // Zodra er al een account is, is deze pagina niet meer bruikbaar.
  if (isSetupComplete()) {
    redirect('/admin/login');
  }

  const fout = searchParams?.fout ? foutmeldingen[searchParams.fout] : undefined;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-heading text-2xl font-semibold text-ink">Beheer instellen</h1>
      <p className="mt-2 text-muted">
        Dit is de allereerste keer dat iemand hier komt: er is nog geen account. Maak hier
        het eerste account aan (wordt automatisch admin). Deze pagina werkt daarna niet meer
        — extra accounts voeg je later toe via het gebruikersbeheer.
      </p>

      {fout && (
        <p className="mt-4 rounded-md border border-amber-dark/30 bg-amber-light px-4 py-3 text-sm text-amber-dark">
          {fout}
        </p>
      )}

      <form action={setupAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Gebruikersnaam
          <input
            type="text"
            name="username"
            required
            minLength={2}
            autoFocus
            className="rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Wachtwoord
          <input
            type="password"
            name="password"
            required
            minLength={10}
            className="rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Herhaal wachtwoord
          <input
            type="password"
            name="bevestiging"
            required
            minLength={10}
            className="rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-teal px-4 py-2 font-medium text-white hover:bg-teal-dark"
        >
          Account aanmaken en inloggen
        </button>
      </form>
    </div>
  );
}
