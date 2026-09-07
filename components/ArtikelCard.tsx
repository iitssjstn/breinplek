import Link from 'next/link';
import type { Artikel } from '@/lib/content';
import CategoryBadge from './CategoryBadge';

export default function ArtikelCard({ artikel }: { artikel: Artikel }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-5">
      <CategoryBadge slug={artikel.categorie} />
      <h3 className="font-heading text-lg font-semibold leading-snug text-ink">
        <Link href={`/artikel/${artikel.slug}`} className="hover:text-teal">
          {artikel.titel}
        </Link>
      </h3>
      <p className="text-[0.95rem] leading-relaxed text-muted">{artikel.samenvatting}</p>
      <p className="mt-auto text-xs text-muted">{artikel.leestijd}</p>
    </article>
  );
}
