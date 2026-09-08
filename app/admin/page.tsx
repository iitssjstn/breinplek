import Link from 'next/link';
import { requireAdminOrRedirect, onlineGebruikers, listUsers } from '@/lib/adminAuth';
import { getAllArtikelen, getAllVragen } from '@/lib/content';
import { deleteArtikelAction, deleteVraagAction } from '@/app/admin/actions';
import { getCategory, categories } from '@/lib/categories';
import { dagtotalenLaatsteDagen, categorieVerdeling, totaalBezoeken } from '@/lib/analytics';
import MiniLineChart from '@/components/admin/MiniLineChart';
import CategoryDonut from '@/components/admin/CategoryDonut';

export const metadata = { title: 'Overzicht' };

const badgeKleur: Record<string, string> = {
  teal: 'border-teal text-teal',
  plum: 'border-plum text-plum',
  amber: 'border-amber text-amber',
};

function StatBadge({ waarde, label, kleur = 'teal' }: { waarde: number | string; label: string; kleur?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border-2 font-heading text-lg font-semibold ${badgeKleur[kleur]}`}
      >
        {waarde}
      </div>
      <p className="text-center text-xs text-muted">{label}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const gebruiker = requireAdminOrRedirect();

  const artikelen = getAllArtikelen();
  const vragen = getAllVragen();
  const online = onlineGebruikers();
  const dagtotalen = dagtotalenLaatsteDagen(14);
  const bezoekenLaatste14 = dagtotalen.reduce((s, d) => s + d.aantal, 0);
  const categorieData = categorieVerdeling();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">
        Welkom terug, {gebruiker.username}
      </h1>
      <p className="mt-1 text-muted">
        {artikelen.length} artikelen, {vragen.length} vragen live.
      </p>

      <section className="mt-8 flex flex-wrap gap-8 rounded-lg border border-line bg-surface p-6">
        <StatBadge waarde={artikelen.length} label="Artikelen" kleur="teal" />
        <StatBadge waarde={vragen.length} label="Vragen" kleur="plum" />
        <StatBadge waarde={categories.length} label="Categorieën" kleur="amber" />
        <StatBadge waarde={totaalBezoeken()} label="Bezoeken totaal" kleur="teal" />
        {gebruiker.role === 'admin' && (
          <StatBadge waarde={listUsers().length} label="Gebruikers" kleur="plum" />
        )}
        <StatBadge waarde={online.length} label="Online nu" kleur="amber" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-sm font-semibold text-ink">
              Paginabezoeken — laatste 14 dagen
            </h2>
            <span className="text-sm text-muted">{bezoekenLaatste14} bezoeken</span>
          </div>
          <div className="mt-4">
            <MiniLineChart data={dagtotalen.map((d) => ({ label: d.datum, waarde: d.aantal }))} />
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6">
          <h2 className="font-heading text-sm font-semibold text-ink">Bezoeken per categorie</h2>
          <div className="mt-4">
            <CategoryDonut segmenten={categorieData} />
          </div>
        </div>
      </section>

      <section className="mt-12">
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
