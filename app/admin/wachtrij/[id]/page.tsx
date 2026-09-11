import { notFound } from 'next/navigation';
import { requireAdminOrRedirect } from '@/lib/adminAuth';
import { getWachtrijItem } from '@/lib/wachtrij';
import { afwijzenWachtrijAction } from '@/app/admin/actions';
import ArtikelForm from '@/components/admin/ArtikelForm';
import VraagForm from '@/components/admin/VraagForm';

export const metadata = { title: 'Concept beoordelen' };
export const dynamic = 'force-dynamic';

export default function WachtrijItemPage({ params }: { params: { id: string } }) {
  requireAdminOrRedirect();

  const item = getWachtrijItem(params.id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-ink">
        Concept beoordelen — {item.soort === 'artikel' ? 'artikel' : 'vraag'}
      </h1>
      <p className="mt-2 text-sm text-muted">
        Gegenereerd met {item.provider} over &quot;{item.onderwerp}&quot;. Controleer en bewerk
        gerust voordat je publiceert.
      </p>

      <div className="mt-6">
        {item.soort === 'artikel' ? (
          <ArtikelForm
            wachtrijId={item.id}
            wachtrijConcept={{
              titel: item.titel ?? '',
              samenvatting: item.samenvatting ?? '',
              categorie: item.categorie,
              inhoud: item.inhoud ?? '',
            }}
          />
        ) : (
          <VraagForm
            wachtrijId={item.id}
            wachtrijConcept={{
              vraag: item.vraag ?? '',
              antwoordKort: item.antwoordKort ?? '',
              antwoord: item.antwoord ?? '',
              categorie: item.categorie,
            }}
          />
        )}
      </div>

      <form action={afwijzenWachtrijAction} className="mt-6">
        <input type="hidden" name="id" value={item.id} />
        <button type="submit" className="text-sm text-amber-dark underline hover:text-ink">
          Afwijzen (verwijderen zonder te publiceren)
        </button>
      </form>
    </div>
  );
}
