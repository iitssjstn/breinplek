import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { isAIConfigured } from '@/lib/aiProviders';
import VraagForm from '@/components/admin/VraagForm';

export const metadata = { title: 'Nieuwe vraag' };

export default function NieuweVraagPage() {
  requireAdminOrRedirect();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">Nieuwe vraag</h1>
      <VraagForm aiBeschikbaar={isAIConfigured()} />
    </div>
  );
}
