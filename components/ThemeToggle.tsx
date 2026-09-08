'use client';

import { useEffect, useState } from 'react';

const OPSLAG_KEY = 'breinplek-thema';

export default function ThemeToggle() {
  const [donker, setDonker] = useState(false);

  useEffect(() => {
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
        className={`relative h-4 w-8 rounded-full transition-colors ${donker ? 'bg-teal' : 'bg-line'}`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-bg transition-transform ${
            donker ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
      {donker ? 'Donker' : 'Licht'}
    </button>
  );
}
