import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { isAIConfigured } from '@/lib/aiProviders';
import ArtikelForm from '@/components/admin/ArtikelForm';

export const metadata = { title: 'Nieuw artikel' };

export default function NieuwArtikelPage() {
  requireAdminOrRedirect();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Nieuw artikel</h1>
      <ArtikelForm aiBeschikbaar={isAIConfigured()} />
    </div>
  );
}
