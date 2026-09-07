import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-muted">
        <p className="max-w-prose">
          Breinplek.nl geeft praktische tips en achtergrond over ADHD en autisme, geschreven
          voor het dagelijks leven. Het vervangt geen diagnose, behandeling of persoonlijk
          advies van een arts, psycholoog of andere zorgprofessional.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/over" className="hover:text-teal">
            Over breinplek
          </Link>
          <Link href="/vragen" className="hover:text-teal">
            Alle vragen
          </Link>
          <a href="mailto:hallo@breinplek.nl" className="hover:text-teal">
            hallo@breinplek.nl
          </a>
        </div>
        <p className="mt-6 text-xs text-muted">
          &copy; {new Date().getFullYear()} Breinplek.nl
        </p>
      </div>
    </footer>
  );
}
