import Link from 'next/link';
import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { getWachtrij } from '@/lib/wachtrij';
import { getCategory } from '@/lib/categories';

export const metadata = { title: 'Wachtrij' };
export const dynamic = 'force-dynamic';

export default function WachtrijPage() {
  requireAdminOrRedirect();
  const items = getWachtrij();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Wachtrij</h1>
      <p className="mt-2 max-w-prose text-muted">
        Concepten die de dagelijkse generator heeft klaargezet. Er gaat niets live totdat je
        een concept hier bekijkt, eventueel aanpast en op &quot;Publiceren&quot; drukt.
      </p>

      {items.length === 0 ? (
        <p className="mt-8 text-muted">Niets in de wachtrij.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-ink">
                  {item.soort === 'artikel' ? item.titel : item.vraag}
                </p>
                <p className="text-xs text-muted">
                  {item.soort === 'artikel' ? 'Artikel' : 'Vraag'} &middot;{' '}
                  {getCategory(item.categorie)?.naam ?? item.categorie} &middot; {item.provider} &middot;{' '}
                  {new Date(item.aangemaaktOp).toLocaleString('nl-NL')}
                </p>
              </div>
              <Link
                href={`/admin/wachtrij/${item.id}`}
                className="shrink-0 text-sm font-medium text-teal hover:text-teal-dark"
              >
                Bekijken
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
