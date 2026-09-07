import Link from 'next/link';
import { hasValidAdminSession } from '@/lib/adminAuth';
import { logoutAction } from '@/app/admin/actions';

export default function AdminNav() {
  const ingelogd = hasValidAdminSession();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
        <Link href="/admin" className="font-heading text-lg font-semibold text-ink">
          breinplek <span className="text-muted">beheer</span>
        </Link>
        {ingelogd && (
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="text-ink hover:text-teal">
              Overzicht
            </Link>
            <Link href="/admin/artikelen/nieuw" className="text-ink hover:text-teal">
              Nieuw artikel
            </Link>
            <Link href="/admin/vragen/nieuw" className="text-ink hover:text-teal">
              Nieuwe vraag
            </Link>
            <Link href="/" className="text-muted hover:text-teal">
              Bekijk site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="text-muted hover:text-teal">
                Uitloggen
              </button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
