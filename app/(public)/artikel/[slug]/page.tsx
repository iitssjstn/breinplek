import { notFound } from 'next/navigation';
import { getAllArtikelen, getArtikelBySlug } from '@/lib/content';
import CategoryBadge from '@/components/CategoryBadge';
import AdSlot from '@/components/AdSlot';

export const revalidate = 60;

export function generateStaticParams() {
  return getAllArtikelen().map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const artikel = getArtikelBySlug(params.slug);
  return { title: artikel ? artikel.titel : 'Artikel' };
}

export default function ArtikelPage({ params }: { params: { slug: string } }) {
  const artikel = getArtikelBySlug(params.slug);
  if (!artikel) notFound();

  return (
    <article className="mx-auto max-w-5xl px-5 py-12">
      <CategoryBadge slug={artikel.categorie} />
      <h1 className="font-heading mt-4 max-w-prose text-3xl font-semibold leading-tight text-ink">
        {artikel.titel}
      </h1>
      <p className="mt-3 text-sm text-muted">{artikel.leestijd}</p>
      <div
        className="article-body mt-8"
        dangerouslySetInnerHTML={{ __html: artikel.inhoudHtml }}
      />
      <AdSlot slotId="artikel-onderaan" />
    </article>
  );
}
