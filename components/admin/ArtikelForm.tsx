'use client';

import { useState } from 'react';
import { categories } from '@/lib/categories';
import type { CategorySlug } from '@/lib/categories';
import type { ArtikelRuw } from '@/lib/content';
import { saveArtikelAction, deleteArtikelAction } from '@/app/admin/actions';

const inputClass =
  'mt-1 w-full rounded-md border border-line bg-bg px-3 py-2 text-ink focus-visible:outline-teal';

export default function ArtikelForm({
  artikel,
  aiBeschikbaar = false,
}: {
  artikel?: ArtikelRuw;
  aiBeschikbaar?: boolean;
}) {
  const [onderwerp, setOnderwerp] = useState('');
  const [genCategorie, setGenCategorie] = useState<CategorySlug>(artikel?.categorie ?? categories[0].slug);
  const [bezigMetGenereren, setBezigMetGenereren] = useState(false);
  const [genFout, setGenFout] = useState<string | null>(null);
  const [genProvider, setGenProvider] = useState<string | null>(null);

  const [titel, setTitel] = useState(artikel?.titel ?? '');
  const [samenvatting, setSamenvatting] = useState(artikel?.samenvatting ?? '');
  const [inhoud, setInhoud] = useState(artikel?.inhoudMarkdown ?? '');

  async function genereerConcept() {
    if (!onderwerp.trim()) {
      setGenFout('Vul eerst een onderwerp in.');
      return;
    }
    setBezigMetGenereren(true);
    setGenFout(null);
    setGenProvider(null);
    try {
      const categorieNaam = categories.find((c) => c.slug === genCategorie)?.naam ?? genCategorie;
      const res = await fetch('/api/admin/genereer-artikel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onderwerp, categorieNaam }),
        signal: AbortSignal.timeout(50000),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenFout(data.fout ?? 'Er ging iets mis.');
        return;
      }
      setTitel(data.titel);
      setSamenvatting(data.samenvatting);
      setInhoud(data.inhoud);
      setGenProvider(data.provider);
    } catch (err) {
      setGenFout(
        err instanceof Error && err.name === 'TimeoutError'
          ? 'De AI-provider reageerde niet binnen 50 seconden. Probeer het nog eens.'
          : 'Kon geen verbinding maken met de AI-provider.'
      );
    } finally {
      setBezigMetGenereren(false);
    }
  }

  return (
    <div className="space-y-10">
      {!artikel && aiBeschikbaar && (
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
              placeholder="Bijv. 'lichaamsbeweging en ADHD'"
              className="flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-teal"
            />
            <select
              value={genCategorie}
              onChange={(e) => setGenCategorie(e.target.value as CategorySlug)}
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

      <form action={saveArtikelAction} className="space-y-5">
        {artikel && <input type="hidden" name="oldSlug" value={artikel.slug} />}
        {artikel?.auteur && <input type="hidden" name="auteur" value={artikel.auteur} />}

        {artikel?.auteur && (
          <p className="text-xs text-muted">Oorspronkelijk aangemaakt door {artikel.auteur}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="titel">
            Titel
          </label>
          <input
            id="titel"
            name="titel"
            required
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className={inputClass}
          />
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
            value={samenvatting}
            onChange={(e) => setSamenvatting(e.target.value)}
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
            value={inhoud}
            onChange={(e) => setInhoud(e.target.value)}
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
