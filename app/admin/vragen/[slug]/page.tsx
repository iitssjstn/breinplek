import { notFound } from 'next/navigation';
import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { getVraagRawBySlug } from '@/lib/content';
import VraagForm from '@/components/admin/VraagForm';

export const metadata = { title: 'Vraag bewerken' };

export default function BewerkVraagPage({ params }: { params: { slug: string } }) {
  requireAdminOrRedirect();

  const vraag = getVraagRawBySlug(params.slug);
  if (!vraag) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Vraag bewerken</h1>
      <VraagForm vraag={vraag} />
    </div>
  );
}
