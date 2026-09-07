import { categories } from '@/lib/categories';
import type { VraagRuw } from '@/lib/content';
import { saveVraagAction, deleteVraagAction } from '@/app/admin/actions';

const inputClass =
  'mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal';

export default function VraagForm({ vraag }: { vraag?: VraagRuw }) {
  return (
    <div className="space-y-10">
      <form action={saveVraagAction} className="space-y-5">
        {vraag && <input type="hidden" name="oldSlug" value={vraag.slug} />}

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="vraag">
            Vraag
          </label>
          <input id="vraag" name="vraag" required defaultValue={vraag?.vraag} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="categorie">
            Categorie
          </label>
          <select
            id="categorie"
            name="categorie"
            defaultValue={vraag?.categorie ?? categories[0].slug}
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
          <label className="block text-sm font-medium text-ink" htmlFor="antwoordKort">
            Kort antwoord (gebruikt bij &quot;vraag van de dag&quot; op de homepage)
          </label>
          <textarea
            id="antwoordKort"
            name="antwoordKort"
            required
            rows={2}
            defaultValue={vraag?.antwoordKortMarkdown}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="antwoord">
            Volledig antwoord (Markdown)
          </label>
          <textarea
            id="antwoord"
            name="antwoord"
            required
            rows={14}
            defaultValue={vraag?.antwoordMarkdown}
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

      {vraag && (
        <form action={deleteVraagAction}>
          <input type="hidden" name="slug" value={vraag.slug} />
          <button type="submit" className="text-sm text-amber-dark underline hover:text-ink">
            Deze vraag verwijderen
          </button>
        </form>
      )}
    </div>
  );
}
