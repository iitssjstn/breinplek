import { categories } from '@/lib/categories';
import type { ArtikelRuw } from '@/lib/content';
import { saveArtikelAction, deleteArtikelAction } from '@/app/admin/actions';

const inputClass =
  'mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal';

export default function ArtikelForm({ artikel }: { artikel?: ArtikelRuw }) {
  return (
    <div className="space-y-10">
      <form action={saveArtikelAction} className="space-y-5">
        {artikel && <input type="hidden" name="oldSlug" value={artikel.slug} />}

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="titel">
            Titel
          </label>
          <input id="titel" name="titel" required defaultValue={artikel?.titel} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="samenvatting">
            Samenvatting (voor de kaartjes op de site)
          </label>
          <textarea
            id="samenvatting"
            name="samenvatting"
            required
            rows={2}
            defaultValue={artikel?.samenvatting}
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="categorie">
              Categorie
            </label>
            <select
              id="categorie"
              name="categorie"
              defaultValue={artikel?.categorie ?? categories[0].slug}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.naam}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink" htmlFor="datum">
              Datum
            </label>
            <input
              id="datum"
              name="datum"
              type="date"
              required
              defaultValue={artikel?.datum}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="inhoud">
            Inhoud (Markdown — ## voor koppen, lege regel tussen alinea's)
          </label>
          <textarea
            id="inhoud"
            name="inhoud"
            required
            rows={18}
            defaultValue={artikel?.inhoudMarkdown}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-teal px-5 py-2 font-medium text-white hover:bg-teal-dark"
        >
          Opslaan
        </button>
      </form>

      {artikel && (
        <form action={deleteArtikelAction}>
          <input type="hidden" name="slug" value={artikel.slug} />
          <button type="submit" className="text-sm text-amber-dark underline hover:text-ink">
            Dit artikel verwijderen
          </button>
        </form>
      )}
    </div>
  );
}
