import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { topPaginas, totaalBezoeken } from '@/lib/analytics';

export const metadata = { title: 'Statistieken' };
export const dynamic = 'force-dynamic';

export default function StatistiekenPage() {
  requireAdminOrRedirect();

  const paginas = topPaginas(30);
  const totaal = totaalBezoeken();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Statistieken</h1>
      <p className="mt-2 text-muted">
        Lichte, zelf gehoste bezoekersstatistieken — geen cookies bij bezoekers, geen externe
        partij. Bezoeken van ingelogde beheerders worden zoveel mogelijk niet meegeteld.
      </p>

      <p className="mt-6 text-sm text-muted">
        Totaal aantal geregistreerde paginabezoeken: <span className="font-medium text-ink">{totaal}</span>
      </p>

      {paginas.length === 0 ? (
        <p className="mt-6 text-muted">Nog geen bezoeken geregistreerd.</p>
      ) : (
        <table className="mt-6 w-full border-y border-line text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 font-medium">Pagina</th>
              <th className="py-2 font-medium">Bezoeken</th>
              <th className="py-2 font-medium">Laatst bezocht</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paginas.map((p) => (
              <tr key={p.pad}>
                <td className="py-2 text-ink">{p.pad}</td>
                <td className="py-2 text-ink">{p.aantal}</td>
                <td className="py-2 text-muted">
                  {new Date(p.laatstBezocht).toLocaleString('nl-NL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
