export const metadata = { title: 'Over breinplek' };

export default function OverPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <h1 className="font-heading text-3xl font-semibold text-ink">Over breinplek.nl</h1>
      <div className="article-body mt-6">
        <p>
          Breinplek is een plek voor mensen met ADHD, autisme of allebei (AuDHD), en voor
          iedereen daaromheen die het beter wil begrijpen. Geen medisch jargon, geen
          eindeloze theorie — vooral uitleg en tips die je dezelfde dag nog kunt gebruiken.
        </p>
        <p>
          De inhoud is geschreven vanuit ervaring en gangbare inzichten uit de praktijk. Het
          is geen vervanging voor diagnostiek, behandeling of persoonlijk advies van een
          arts, psycholoog of andere zorgprofessional. Bij twijfel of als iets echt niet
          lekker loopt, is contact met een professional altijd de beste volgende stap.
        </p>
        <p>
          Heb je een vraag die hier nog niet beantwoord wordt, of een tip die je zelf hebt
          ontdekt en die anderen kan helpen? Mail naar{' '}
          <a href="mailto:hallo@breinplek.nl">hallo@breinplek.nl</a>.
        </p>
      </div>
    </div>
  );
}
