'use client';

import { useState } from 'react';

interface Segment {
  naam: string;
  kleur: string; // Tailwind-tokennaam: 'teal' | 'plum' | 'amber' | 'muted'
  aantal: number;
}

const KLEURVAR: Record<string, string> = {
  teal: 'var(--color-teal)',
  plum: 'var(--color-plum)',
  amber: 'var(--color-amber)',
  muted: 'var(--color-muted)',
};

function polarNaarCartesiaans(cx: number, cy: number, r: number, hoekGraden: number) {
  const hoekRad = ((hoekGraden - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(hoekRad), y: cy + r * Math.sin(hoekRad) };
}

// Booglijn (geen volle cirkel) van startHoek tot eindHoek, met de klok mee,
// 0 graden = boven. Losse paden i.p.v. overlappende cirkels-met-dash, zodat
// elk segment zijn eigen, correcte hover-gebied heeft.
function beschrijfBoog(cx: number, cy: number, r: number, startHoek: number, eindHoek: number): string {
  const start = polarNaarCartesiaans(cx, cy, r, startHoek);
  const eind = polarNaarCartesiaans(cx, cy, r, eindHoek);
  const grootBoog = eindHoek - startHoek > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${grootBoog} 1 ${eind.x} ${eind.y}`;
}

export default function CategoryDonut({ segmenten }: { segmenten: Segment[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const totaal = segmenten.reduce((s, seg) => s + seg.aantal, 0);
  const straal = 60;

  let hoekTotNu = 0;
  const bogen = segmenten.map((seg) => {
    const fractie = totaal > 0 ? seg.aantal / totaal : 0;
    // Bijna-volledige cirkel (99.9%) i.p.v. 100%, anders vallen start- en
    // eindpunt van de boog samen en verdwijnt het pad.
    const graden = Math.min(fractie * 360, 359.9);
    const start = hoekTotNu;
    const eind = hoekTotNu + graden;
    hoekTotNu = eind;
    return { ...seg, start, eind };
  });

  const gehoverd = hoverIndex !== null ? bogen[hoverIndex] : null;
  const percentageGehoverd =
    gehoverd && totaal > 0 ? Math.round((gehoverd.aantal / totaal) * 100) : null;

  return (
    <div className="flex items-center gap-6">
      <svg
        viewBox="0 0 160 160"
        className="h-32 w-32 shrink-0"
        role="img"
        aria-label="Bezoeken per categorie"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <circle cx="80" cy="80" r={straal} fill="none" stroke="var(--color-line)" strokeWidth={20} />
        {totaal > 0 &&
          bogen.map((boog, i) => (
            <path
              key={boog.naam}
              d={beschrijfBoog(80, 80, straal, boog.start, boog.eind)}
              fill="none"
              stroke={KLEURVAR[boog.kleur] ?? 'var(--color-teal)'}
              strokeWidth={hoverIndex === i ? 24 : 20}
              opacity={hoverIndex === null || hoverIndex === i ? 1 : 0.45}
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}
        <text x="80" y={gehoverd ? 74 : 76} textAnchor="middle" className="fill-ink" style={{ fontSize: gehoverd ? 20 : 22, fontWeight: 600 }}>
          {gehoverd ? `${percentageGehoverd}%` : totaal}
        </text>
        <text x="80" y="94" textAnchor="middle" className="fill-muted" style={{ fontSize: 11 }}>
          {gehoverd ? gehoverd.naam : 'bezoeken'}
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {segmenten.map((seg, i) => (
          <li
            key={seg.naam}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            className={`flex items-center gap-2 rounded px-1 -mx-1 transition-colors ${
              hoverIndex === i ? 'bg-surface2' : ''
            }`}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: KLEURVAR[seg.kleur] ?? 'var(--color-teal)' }}
            />
            <span className="text-ink">{seg.naam}</span>
            <span className="text-muted">
              {totaal > 0 ? Math.round((seg.aantal / totaal) * 100) : 0}%
            </span>
          </li>
        ))}
        {segmenten.length === 0 && <li className="text-muted">Nog geen bezoeken.</li>}
      </ul>
    </div>
  );
}
