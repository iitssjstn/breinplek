import Link from 'next/link';
import { getCategory } from '@/lib/categories';

const kleurKlassen: Record<string, string> = {
  teal: 'bg-teal-light text-teal-dark',
  plum: 'bg-plum-light text-plum-dark',
  amber: 'bg-amber-light text-amber-dark',
};

export default function CategoryBadge({ slug }: { slug: string }) {
  const categorie = getCategory(slug);
  if (!categorie) return null;
  return (
    <Link
      href={`/categorie/${categorie.slug}`}
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${kleurKlassen[categorie.kleur]}`}
    >
      {categorie.naam}
    </Link>
  );
}
