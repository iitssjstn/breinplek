import { notFound } from 'next/navigation';
import { getAllVragen, getVraagBySlug } from '@/lib/content';
import CategoryBadge from '@/components/CategoryBadge';

export const revalidate = 60;

export function generateStaticParams() {
  return getAllVragen().map((v) => ({ slug: v.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const vraag = getVraagBySlug(params.slug);
  return { title: vraag ? vraag.vraag : 'Vraag' };
}

export default function VraagPage({ params }: { params: { slug: string } }) {
  const vraag = getVraagBySlug(params.slug);
  if (!vraag) notFound();

  return (
    <article className="mx-auto max-w-5xl px-5 py-12">
      <CategoryBadge slug={vraag.categorie} />
      <h1 className="font-heading mt-4 max-w-prose text-2xl font-semibold leading-tight text-ink sm:text-3xl">
        {vraag.vraag}
      </h1>
      <div className="article-body mt-8" dangerouslySetInnerHTML={{ __html: vraag.antwoordHtml }} />
    </article>
  );
}
