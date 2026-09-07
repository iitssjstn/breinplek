import Link from 'next/link';
import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { getAllArtikelen, getAllVragen } from '@/lib/content';
import { deleteArtikelAction, deleteVraagAction } from '@/app/admin/actions';
import { getCategory } from '@/lib/categories';

export const metadata = { title: 'Overzicht' };

export default function AdminDashboardPage() {
  requireAdminOrRedirect();

  const artikelen = getAllArtikelen();
  const vragen = getAllVragen();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Overzicht</h1>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-ink">
            Artikelen ({artikelen.length})
          </h2>
          <Link href="/admin/artikelen/nieuw" className="text-sm font-medium text-teal hover:text-teal-dark">
            + Nieuw artikel
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {artikelen.map((a) => (
            <li key={a.slug} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-ink">{a.titel}</p>
                <p className="text-xs text-muted">
                  {getCategory(a.categorie)?.naam ?? a.categorie} &middot; {a.datum}
                  {a.auteur && <> &middot; door {a.auteur}</>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <Link href={`/artikel/${a.slug}`} className="text-muted hover:text-teal">
                  Bekijk
                </Link>
                <Link href={`/admin/artikelen/${a.slug}`} className="text-teal hover:text-teal-dark">
                  Bewerken
                </Link>
                <form action={deleteArtikelAction}>
                  <input type="hidden" name="slug" value={a.slug} />
                  <button type="submit" className="text-amber-dark hover:underline">
                    Verwijderen
                  </button>
                </form>
              </div>
            </li>
          ))}
          {artikelen.length === 0 && <li className="py-3 text-muted">Nog geen artikelen.</li>}
        </ul>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-ink">
            Vragen &amp; antwoorden ({vragen.length})
          </h2>
          <Link href="/admin/vragen/nieuw" className="text-sm font-medium text-teal hover:text-teal-dark">
            + Nieuwe vraag
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {vragen.map((v) => (
            <li key={v.slug} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-ink">{v.vraag}</p>
                <p className="text-xs text-muted">
                  {getCategory(v.categorie)?.naam ?? v.categorie}
                  {v.auteur && <> &middot; door {v.auteur}</>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                <Link href={`/vragen/${v.slug}`} className="text-muted hover:text-teal">
                  Bekijk
                </Link>
                <Link href={`/admin/vragen/${v.slug}`} className="text-teal hover:text-teal-dark">
                  Bewerken
                </Link>
                <form action={deleteVraagAction}>
                  <input type="hidden" name="slug" value={v.slug} />
                  <button type="submit" className="text-amber-dark hover:underline">
                    Verwijderen
                  </button>
                </form>
              </div>
            </li>
          ))}
          {vragen.length === 0 && <li className="py-3 text-muted">Nog geen vragen.</li>}
        </ul>
      </section>
    </div>
  );
}
