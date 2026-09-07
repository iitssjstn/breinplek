import Link from 'next/link';
import { getSessionUser } from '@/lib/adminAuth';
import { logoutAction } from '@/app/admin/actions';
import AdminSidebarLinks from './AdminSidebarLinks';

export default function AdminSidebar() {
  const gebruiker = getSessionUser();
  if (!gebruiker) return null;

  const items = [
    { href: '/admin', label: 'Overzicht', exact: true },
    { href: '/admin/artikelen/nieuw', label: '+ Nieuw artikel' },
    { href: '/admin/vragen/nieuw', label: '+ Nieuwe vraag' },
    ...(gebruiker.role === 'admin'
      ? [{ href: '/admin/gebruikers', label: 'Gebruikers' }]
      : []),
  ];

  return (
    <aside className="flex shrink-0 flex-col border-b border-line bg-surface md:h-screen md:w-56 md:border-b-0 md:border-r">
      <div className="px-4 py-4">
        <Link href="/admin" className="font-heading text-lg font-semibold text-ink">
          breinplek <span className="text-muted">beheer</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:px-3">
        <AdminSidebarLinks items={items} />
      </nav>

      <div className="border-t border-line px-3 py-3">
        <Link href="/" className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-surface2">
          ← Bekijk site
        </Link>
        <div className="mt-2 flex items-center justify-between px-3">
          <div className="text-xs text-muted">
            <p className="font-medium text-ink">{gebruiker.username}</p>
            <p>{gebruiker.role === 'admin' ? 'Admin' : 'Redacteur'}</p>
          </div>
          <form action={logoutAction}>
            <button type="submit" className="text-xs text-muted hover:text-teal">
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
