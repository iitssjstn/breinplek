import { redirect } from 'next/navigation';
import { isSetupComplete } from '@/lib/adminAuth';
import { loginAction } from '@/app/admin/actions';

export const metadata = { title: 'Inloggen' };

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { fout?: string };
}) {
  // Nog geen account? Dan hoort de eenmalige setup hier, niet inloggen.
  if (!isSetupComplete()) {
    redirect('/admin/setup');
  }

  const fout = searchParams?.fout === '1';

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-heading text-2xl font-semibold text-ink">Inloggen</h1>
      <p className="mt-2 text-muted">Toegang tot het beheer van breinplek.nl.</p>

      {fout && (
        <p className="mt-4 rounded-md border border-amber-dark bg-amber-light px-4 py-3 text-sm text-amber-dark">
          Die combinatie klopt niet. Probeer het opnieuw.
        </p>
      )}

      <form action={loginAction} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Gebruikersnaam
          <input
            type="text"
            name="username"
            required
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
            className="rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-teal px-4 py-2 font-medium text-white hover:bg-teal-dark"
        >
          Inloggen
        </button>
      </form>
    </div>
  );
}
