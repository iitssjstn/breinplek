import { requireAdminRoleOrRedirect } from '@/lib/adminAuth';
import { listUsers } from '@/lib/adminAuth';
import { createUserAction, deleteUserAction } from '@/app/admin/actions';

export const metadata = { title: 'Gebruikers' };

const foutmeldingen: Record<string, string> = {
  gebruikersnaam: 'Kies een gebruikersnaam van minstens 2 tekens.',
  kort: 'Kies een wachtwoord van minstens 10 tekens.',
  mismatch: 'De twee wachtwoorden komen niet overeen.',
  'bestaat-al': 'Die gebruikersnaam bestaat al.',
  zelf: 'Je kunt je eigen account hier niet verwijderen.',
  'laatste-admin': 'Dit is de laatste admin — verwijderen kan niet, dan sluit je iedereen buiten.',
};

export default function GebruikersPage({ searchParams }: { searchParams: { fout?: string } }) {
  const ingelogd = requireAdminRoleOrRedirect();
  const gebruikers = listUsers();
  const fout = searchParams?.fout ? foutmeldingen[searchParams.fout] : undefined;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Gebruikers</h1>
      <p className="mt-2 text-muted">
        Iedereen hier kan artikelen en vragen aanmaken en bewerken. Alleen admins kunnen
        accounts beheren.
      </p>

      {fout && (
        <p className="mt-4 rounded-md border border-amber-dark/30 bg-amber-light px-4 py-3 text-sm text-amber-dark">
          {fout}
        </p>
      )}

      <ul className="mt-6 divide-y divide-line border-y border-line">
        {gebruikers.map((u) => (
          <li key={u.username} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium text-ink">
                {u.username}
                {u.username.toLowerCase() === ingelogd.username.toLowerCase() && (
                  <span className="ml-2 text-xs text-muted">(jij)</span>
                )}
              </p>
              <p className="text-xs text-muted">
                {u.role === 'admin' ? 'Admin' : 'Redacteur'} &middot; sinds{' '}
                {new Date(u.aangemaaktOp).toLocaleDateString('nl-NL')}
              </p>
            </div>
            {u.username.toLowerCase() !== ingelogd.username.toLowerCase() && (
              <form action={deleteUserAction}>
                <input type="hidden" name="username" value={u.username} />
                <button type="submit" className="text-sm text-amber-dark hover:underline">
                  Verwijderen
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <section className="mt-12 max-w-sm">
        <h2 className="font-heading text-lg font-semibold text-ink">Nieuw account</h2>
        <form action={createUserAction} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Gebruikersnaam
            <input
              type="text"
              name="username"
              required
              minLength={2}
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
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            Rol
            <select
              name="role"
              defaultValue="redacteur"
              className="rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal"
            >
              <option value="redacteur">Redacteur (kan artikelen/vragen beheren)</option>
              <option value="admin">Admin (kan ook gebruikers beheren)</option>
            </select>
          </label>
          <div>
            <button
              type="submit"
              className="rounded-md bg-teal px-5 py-2.5 font-medium text-white hover:bg-teal-dark"
            >
              Account aanmaken
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
