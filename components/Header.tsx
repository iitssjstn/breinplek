import Link from 'next/link';
import { categories } from '@/lib/categories';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="border-b border-line bg-bg">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="font-heading text-xl font-bold text-ink">
          brein<span className="text-teal">plek</span>
          <span className="text-muted">.nl</span>
        </Link>
        <nav aria-label="Hoofdmenu">
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.95rem] font-medium text-ink">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categorie/${c.slug}`} className="hover:text-teal">
                  {c.naam}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/vragen" className="hover:text-teal">
                Vragen
              </Link>
            </li>
            <li>
              <Link href="/over" className="hover:text-teal">
                Over
              </Link>
            </li>
          </ul>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
