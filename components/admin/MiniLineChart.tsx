interface Punt {
  label: string;
  waarde: number;
}

export default function MiniLineChart({ data }: { data: Punt[] }) {
  const breedte = 600;
  const hoogte = 160;
  const padding = 12;
  const max = Math.max(1, ...data.map((p) => p.waarde));

  const stapX = (breedte - padding * 2) / Math.max(1, data.length - 1);
  const punten = data.map((p, i) => {
    const x = padding + i * stapX;
    const y = padding + (1 - p.waarde / max) * (hoogte - padding * 2);
    return { x, y, ...p };
  });

  const lijnPad = punten.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const vlakPad = `${lijnPad} L ${punten[punten.length - 1].x} ${hoogte - padding} L ${punten[0].x} ${hoogte - padding} Z`;

  return (
    <svg viewBox={`0 0 ${breedte} ${hoogte}`} className="w-full" role="img" aria-label="Paginabezoeken per dag">
      <path d={vlakPad} fill="var(--color-teal)" opacity={0.12} />
      <path d={lijnPad} fill="none" stroke="var(--color-teal)" strokeWidth={2} />
      {punten.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r={2.5} fill="var(--color-teal)" />
      ))}
    </svg>
  );
}
