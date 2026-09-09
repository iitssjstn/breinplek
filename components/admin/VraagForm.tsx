'use client';

import { useState } from 'react';
import { categories } from '@/lib/categories';
import type { CategorySlug } from '@/lib/categories';
import type { VraagRuw } from '@/lib/content';
import { saveVraagAction, deleteVraagAction } from '@/app/admin/actions';

const inputClass =
  'mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal';

export default function VraagForm({
  vraag,
  aiBeschikbaar = false,
}: {
  vraag?: VraagRuw;
  aiBeschikbaar?: boolean;
}) {
  const [onderwerp, setOnderwerp] = useState('');
  const [categorie, setCategorie] = useState<CategorySlug>(vraag?.categorie ?? categories[0].slug);
  const [bezigMetGenereren, setBezigMetGenereren] = useState(false);
  const [genFout, setGenFout] = useState<string | null>(null);
  const [genProvider, setGenProvider] = useState<string | null>(null);

  const [vraagTekst, setVraagTekst] = useState(vraag?.vraag ?? '');
  const [antwoordKort, setAntwoordKort] = useState(vraag?.antwoordKortMarkdown ?? '');
  const [antwoord, setAntwoord] = useState(vraag?.antwoordMarkdown ?? '');

  async function genereerConcept() {
    if (!onderwerp.trim()) {
      setGenFout('Vul eerst een onderwerp in.');
      return;
    }
    setBezigMetGenereren(true);
    setGenFout(null);
    setGenProvider(null);
    try {
      const categorieNaam = categories.find((c) => c.slug === categorie)?.naam ?? categorie;
      const res = await fetch('/api/admin/genereer-vraag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onderwerp, categorieNaam }),
        signal: AbortSignal.timeout(190000),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenFout(data.fout ?? 'Er ging iets mis.');
        return;
      }
      setVraagTekst(data.vraag);
      setAntwoordKort(data.antwoordKort);
      setAntwoord(data.antwoord);
      setGenProvider(data.provider);
    } catch (err) {
      setGenFout(
        err instanceof Error && err.name === 'TimeoutError'
          ? 'De AI-provider reageerde niet binnen 3 minuten. Probeer het nog eens.'
          : 'Kon geen verbinding maken met de AI-provider.'
      );
    } finally {
      setBezigMetGenereren(false);
    }
  }

  return (
    <div className="space-y-10">
      {!vraag && aiBeschikbaar && (
        <section className="rounded-md border border-teal bg-teal-light p-4">
          <h2 className="font-heading text-sm font-semibold text-teal-dark">
            Concept genereren met AI (optioneel)
          </h2>
          <p className="mt-1 text-xs text-muted">
            Vult de velden hieronder in met een AI-gegenereerd concept. Controleer en bewerk
            altijd zelf voordat je opslaat.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={onderwerp}
              onChange={(e) => setOnderwerp(e.target.value)}
              placeholder="Bijv. 'oogcontact tijdens sollicitatiegesprekken'"
              className="flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-teal"
            />
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value as CategorySlug)}
              className="rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-teal"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.naam}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={genereerConcept}
              disabled={bezigMetGenereren}
              className="whitespace-nowrap rounded-md bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark disabled:opacity-60"
            >
              {bezigMetGenereren ? 'Bezig...' : 'Genereer concept'}
            </button>
          </div>
          {genFout && <p className="mt-2 text-xs text-amber-dark">{genFout}</p>}
          {genProvider && (
            <p className="mt-2 text-xs text-muted">Gegenereerd met {genProvider}.</p>
          )}
        </section>
      )}

      <form action={saveVraagAction} className="space-y-5">
        {vraag && <input type="hidden" name="oldSlug" value={vraag.slug} />}
        {vraag?.auteur && <input type="hidden" name="auteur" value={vraag.auteur} />}

        {vraag?.auteur && (
          <p className="text-xs text-muted">Oorspronkelijk aangemaakt door {vraag.auteur}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="vraag">
            Vraag
          </label>
          <input
            id="vraag"
            name="vraag"
            required
            value={vraagTekst}
            onChange={(e) => setVraagTekst(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="categorie">
            Categorie
          </label>
          <select
            id="categorie"
            name="categorie"
            value={categorie}
              onChange={(e) => setCategorie(e.target.value as CategorySlug)}
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
            value={antwoordKort}
            onChange={(e) => setAntwoordKort(e.target.value)}
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
            value={antwoord}
            onChange={(e) => setAntwoord(e.target.value)}
            className={`${inputClass} font-mono text-sm`}
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="uitgelicht"
              defaultChecked={vraag?.uitgelicht}
              className="h-4 w-4 rounded border-line accent-teal"
            />
            Toon als &quot;vraag van de dag&quot; op de homepage
          </label>
          <p className="mt-1 text-xs text-muted">
            Overschrijft de automatische, datum-gebaseerde keuze. Er kan maar één vraag
            tegelijk vastgezet zijn — activeer je deze, dan wordt die van een eventuele
            andere vraag automatisch uitgezet.
          </p>
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
