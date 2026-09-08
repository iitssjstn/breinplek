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

export default function CategoryDonut({ segmenten }: { segmenten: Segment[] }) {
  const totaal = segmenten.reduce((s, seg) => s + seg.aantal, 0);
  const straal = 60;
  const omtrek = 2 * Math.PI * straal;

  let verschoven = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-32 w-32 shrink-0" role="img" aria-label="Bezoeken per categorie">
        <circle cx="80" cy="80" r={straal} fill="none" stroke="var(--color-line)" strokeWidth={20} />
        {totaal > 0 &&
          segmenten.map((seg) => {
            const fractie = seg.aantal / totaal;
            const lengte = fractie * omtrek;
            const dashArray = `${lengte} ${omtrek - lengte}`;
            const dashOffset = -verschoven;
            verschoven += lengte;
            return (
              <circle
                key={seg.naam}
                cx="80"
                cy="80"
                r={straal}
                fill="none"
                stroke={KLEURVAR[seg.kleur] ?? 'var(--color-teal)'}
                strokeWidth={20}
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 80 80)"
              />
            );
          })}
        <text x="80" y="76" textAnchor="middle" className="fill-ink" style={{ fontSize: 22, fontWeight: 600 }}>
          {totaal}
        </text>
        <text x="80" y="94" textAnchor="middle" className="fill-muted" style={{ fontSize: 11 }}>
          bezoeken
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {segmenten.map((seg) => (
          <li key={seg.naam} className="flex items-center gap-2">
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
