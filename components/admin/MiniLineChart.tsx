'use client';

import { useState } from 'react';

interface Punt {
  label: string; // datum, 'YYYY-MM-DD'
  waarde: number;
}

function formatDatum(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

export default function MiniLineChart({ data }: { data: Punt[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const breedte = 600;
  const hoogte = 190;
  const tooltipRuimte = 34; // ruimte boven de grafiek, zodat de tooltip niet wordt afgesneden
  const bodemPadding = 22;
  const zijPadding = 12;
  const max = Math.max(1, ...data.map((p) => p.waarde));

  const stapX = data.length > 1 ? (breedte - zijPadding * 2) / (data.length - 1) : 0;
  const punten = data.map((p, i) => {
    const x = zijPadding + i * stapX;
    const y = tooltipRuimte + (1 - p.waarde / max) * (hoogte - tooltipRuimte - bodemPadding);
    return { x, y, ...p };
  });

  const lijnPad = punten.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const basisY = hoogte - bodemPadding;
  const vlakPad = `${lijnPad} L ${punten[punten.length - 1].x} ${basisY} L ${punten[0].x} ${basisY} Z`;

  const gehoverd = hoverIndex !== null ? punten[hoverIndex] : null;
  // Tooltip rechts van het punt tonen, tenzij dat buiten de grafiek zou vallen.
  const tooltipLinks = gehoverd && gehoverd.x > breedte - 90;

  return (
    <svg
      viewBox={`0 0 ${breedte} ${hoogte}`}
      className="w-full"
      role="img"
      aria-label="Paginabezoeken per dag"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <path d={vlakPad} fill="var(--color-teal)" opacity={0.12} />
      <path d={lijnPad} fill="none" stroke="var(--color-teal)" strokeWidth={2} />

      {gehoverd && (
        <line
          x1={gehoverd.x}
          y1={tooltipRuimte}
          x2={gehoverd.x}
          y2={basisY}
          stroke="var(--color-line)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}

      {punten.map((p, i) => (
        <circle
          key={p.label}
          cx={p.x}
          cy={p.y}
          r={hoverIndex === i ? 4.5 : 2.5}
          fill="var(--color-teal)"
          className="transition-[r]"
        />
      ))}

      {/* Onzichtbare, brede hitboxen per datapunt -- veel makkelijker te
          raken met de muis dan de kleine puntjes zelf. */}
      {punten.map((p, i) => (
        <rect
          key={`hit-${p.label}`}
          x={p.x - stapX / 2}
          y={0}
          width={stapX || breedte}
          height={hoogte}
          fill="transparent"
          onMouseEnter={() => setHoverIndex(i)}
        />
      ))}

      {gehoverd && (
        <g transform={`translate(${tooltipLinks ? gehoverd.x - 82 : gehoverd.x + 8}, ${Math.max(gehoverd.y - 30, 2)})`}>
          <rect width={78} height={30} rx={6} fill="var(--color-surface2)" stroke="var(--color-line)" />
          <text x={8} y={13} className="fill-muted" style={{ fontSize: 9 }}>
            {formatDatum(gehoverd.label)}
          </text>
          <text x={8} y={25} className="fill-ink" style={{ fontSize: 12, fontWeight: 600 }}>
            {gehoverd.waarde} bezoeken
          </text>
        </g>
      )}
    </svg>
  );
}
