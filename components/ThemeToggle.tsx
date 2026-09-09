'use client';

import { useLayoutEffect, useState } from 'react';

const OPSLAG_KEY = 'breinplek-thema';

export default function ThemeToggle() {
  // Begint bewust op false (moet gelijk zijn aan wat de server rendert).
  // useLayoutEffect synchroniseert dit vóór de browser schildert, zodat de
  // korte flits die je zag zo goed als verdwijnt.
  const [donker, setDonker] = useState(false);

  useLayoutEffect(() => {
    setDonker(document.documentElement.classList.contains('dark'));
  }, []);

  function wissel() {
    const nieuw = !donker;
    setDonker(nieuw);
    document.documentElement.classList.toggle('dark', nieuw);
    try {
      localStorage.setItem(OPSLAG_KEY, nieuw ? 'donker' : 'licht');
    } catch {
      // localStorage kan geblokkeerd zijn (privémodus e.d.) -- dan wisselt
      // het thema wel voor deze sessie, maar onthouden we het niet.
    }
  }

  return (
    <button
      type="button"
      onClick={wissel}
      aria-pressed={donker}
      className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:border-teal"
    >
      <span
        aria-hidden="true"
        className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${donker ? 'bg-teal' : 'bg-line'}`}
      >
        {/* Vast wit bolletje met schaduw: blijft in beide thema's goed
            zichtbaar, in plaats van een kleur die met het thema meewisselt
            en op de track kan wegvallen. */}
        <span
          className={`absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
            donker ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
      {donker ? 'Donker' : 'Licht'}
    </button>
  );
}
