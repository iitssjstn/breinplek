import { notFound } from 'next/navigation';
import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { getArtikelRawBySlug } from '@/lib/content';
import ArtikelForm from '@/components/admin/ArtikelForm';

export const metadata = { title: 'Artikel bewerken' };

export default function BewerkArtikelPage({ params }: { params: { slug: string } }) {
  requireAdminOrRedirect();

  const artikel = getArtikelRawBySlug(params.slug);
  if (!artikel) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Artikel bewerken</h1>
      <ArtikelForm artikel={artikel} />
    </div>
  );
}
