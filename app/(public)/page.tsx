import Link from 'next/link';
import { getAllArtikelen, getAllVragen } from '@/lib/content';
import { categories } from '@/lib/categories';
import ArtikelCard from '@/components/ArtikelCard';
import CategoryBadge from '@/components/CategoryBadge';

export const revalidate = 60;

function kiesVraagVanDeDag(aantal: number) {
  const dagVanHetJaar = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return aantal > 0 ? dagVanHetJaar % aantal : 0;
}

export default function HomePage() {
  const artikelen = getAllArtikelen().slice(0, 6);
  const vragen = getAllVragen();
  const vraagVanDeDag = vragen.length > 0 ? vragen[kiesVraagVanDeDag(vragen.length)] : undefined;

  return (
    <>
      <section className="mx-auto max-w-5xl px-5 pt-14 pb-10">
        <h1 className="font-heading max-w-2xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Praktische hulp voor een brein dat anders werkt
        </h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
          Breinplek verzamelt uitleg, tips en antwoorden op vragen over ADHD en autisme —
          geschreven om meteen iets mee te doen, niet om nog een keer te horen wat er mis is.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <CategoryBadge key={c.slug} slug={c.slug} />
          ))}
        </div>
      </section>

      {vraagVanDeDag && (
        <section className="mx-auto max-w-5xl px-5 pb-14">
          <div className="rounded-xl border border-teal bg-teal-light p-6 sm:p-8">
            <p className="font-heading text-sm font-semibold uppercase tracking-wide text-teal-dark">
              Vraag van de dag
            </p>
            <h2 className="font-heading mt-2 text-xl font-semibold text-ink sm:text-2xl">
              {vraagVanDeDag.vraag}
            </h2>
            <div
              className="mt-3 max-w-prose text-[1.05rem] leading-relaxed text-ink"
              dangerouslySetInnerHTML={{ __html: vraagVanDeDag.antwoordKortHtml }}
            />
            <Link
              href={`/vragen/${vraagVanDeDag.slug}`}
              className="mt-4 inline-block font-medium text-teal-dark underline underline-offset-2 hover:text-ink"
            >
              Lees het volledige antwoord
            </Link>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-5 pb-14">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-semibold text-ink">Nieuwste tips</h2>
          <Link href="/vragen" className="text-sm font-medium text-teal hover:text-teal-dark">
            Alle vragen &amp; antwoorden
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artikelen.map((artikel) => (
            <ArtikelCard key={artikel.slug} artikel={artikel} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="font-heading text-xl font-semibold text-ink">Kies een onderwerp</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categorie/${c.slug}`}
              className="rounded-lg border border-line bg-surface p-5 transition-colors hover:border-teal"
            >
              <h3 className="font-heading text-lg font-semibold text-ink">{c.naam}</h3>
              <p className="mt-1 text-[0.95rem] text-muted">{c.omschrijving}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
