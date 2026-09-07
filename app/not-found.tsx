import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-20 text-center">
      <h1 className="font-heading text-3xl font-semibold text-ink">Deze pagina bestaat niet</h1>
      <p className="mt-3 text-muted">
        Misschien is de link verlopen, of stond het artikel op een ander adres.
      </p>
      <Link href="/" className="mt-6 inline-block font-medium text-teal hover:text-teal-dark">
        Terug naar de homepage
      </Link>
    </div>
  );
}
