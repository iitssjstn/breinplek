import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categories, getCategory } from '@/lib/categories';
import { getArtikelenByCategorie, getVragenByCategorie } from '@/lib/content';
import ArtikelCard from '@/components/ArtikelCard';

export const revalidate = 60;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const categorie = getCategory(params.slug);
  return { title: categorie ? categorie.naam : 'Categorie' };
}

export default function CategoriePage({ params }: { params: { slug: string } }) {
  const categorie = getCategory(params.slug);
  if (!categorie) notFound();

  const artikelen = getArtikelenByCategorie(categorie.slug);
  const vragen = getVragenByCategorie(categorie.slug);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-heading text-3xl font-semibold text-ink">{categorie.naam}</h1>
      <p className="mt-2 max-w-prose text-lg text-muted">{categorie.omschrijving}</p>

      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-ink">Tips &amp; artikelen</h2>
        {artikelen.length === 0 ? (
          <p className="mt-3 text-muted">Hier staan binnenkort artikelen over {categorie.naam}.</p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artikelen.map((a) => (
              <ArtikelCard key={a.slug} artikel={a} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-heading text-lg font-semibold text-ink">Vragen over {categorie.naam}</h2>
        {vragen.length === 0 ? (
          <p className="mt-3 text-muted">Nog geen vragen in deze categorie.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {vragen.map((v) => (
              <li key={v.slug} className="rounded-lg border border-line bg-surface p-4">
                <Link href={`/vragen/${v.slug}`} className="font-medium text-ink hover:text-teal">
                  {v.vraag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
