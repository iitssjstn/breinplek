import Link from 'next/link';
import { categories } from '@/lib/categories';
import { getVragenByCategorie } from '@/lib/content';

export const revalidate = 60;
export const metadata = { title: 'Vragen & antwoorden' };

export default function VragenPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-heading text-3xl font-semibold text-ink">Vragen &amp; antwoorden</h1>
      <p className="mt-2 max-w-prose text-lg text-muted">
        Korte, directe antwoorden op vragen die vaak terugkomen. Klik door voor het volledige
        antwoord en praktische stappen.
      </p>

      <div className="mt-10 space-y-12">
        {categories.map((categorie) => {
          const vragen = getVragenByCategorie(categorie.slug);
          if (vragen.length === 0) return null;
          return (
            <section key={categorie.slug}>
              <h2 className="font-heading text-lg font-semibold text-ink">{categorie.naam}</h2>
              <ul className="mt-4 space-y-3">
                {vragen.map((v) => (
                  <li key={v.slug} className="rounded-lg border border-line bg-surface p-4">
                    <Link href={`/vragen/${v.slug}`} className="font-medium text-ink hover:text-teal">
                      {v.vraag}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
