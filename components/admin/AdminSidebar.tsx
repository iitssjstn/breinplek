import Link from 'next/link';
import { getSessionUser, onlineGebruikers } from '@/lib/adminAuth';
import { getWachtrij } from '@/lib/wachtrij';
import { logoutAction } from '@/app/admin/actions';
import AdminSidebarLinks from './AdminSidebarLinks';
import LiveTeamledenActief from './LiveTeamledenActief';
import {
  IconOverzicht,
  IconArtikel,
  IconVraag,
  IconStatistieken,
  IconWachtrij,
  IconGebruikers,
  IconBackup,
  IconInstellingen,
  IconBekijkSite,
} from './icons';

export default function AdminSidebar() {
  const gebruiker = getSessionUser();
  if (!gebruiker) return null;

  const online = onlineGebruikers().filter((naam) => naam.toLowerCase() !== gebruiker.username.toLowerCase());
  const wachtrijAantal = getWachtrij().length;

  const contentItems = [
    { href: '/admin', label: 'Overzicht', icon: <IconOverzicht />, exact: true },
    { href: '/admin/artikelen/nieuw', label: 'Nieuw artikel', icon: <IconArtikel /> },
    { href: '/admin/vragen/nieuw', label: 'Nieuwe vraag', icon: <IconVraag /> },
    { href: '/admin/wachtrij', label: 'Wachtrij', icon: <IconWachtrij />, badge: wachtrijAantal },
    { href: '/admin/statistieken', label: 'Statistieken', icon: <IconStatistieken /> },
  ];

  const beheerItems =
    gebruiker.role === 'admin'
      ? [
          { href: '/admin/gebruikers', label: 'Gebruikers', icon: <IconGebruikers /> },
          { href: '/admin/backup', label: 'Backup', icon: <IconBackup /> },
          { href: '/admin/instellingen', label: 'Instellingen', icon: <IconInstellingen /> },
        ]
      : [];

  return (
    <aside className="flex shrink-0 flex-col border-b border-line bg-surface md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal font-heading text-sm font-semibold text-white">
          {gebruiker.username.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{gebruiker.username}</p>
          <p className="text-xs text-muted">{gebruiker.role === 'admin' ? 'Admin' : 'Redacteur'}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-2 md:overflow-visible">
        <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted">Content</p>
        <AdminSidebarLinks items={contentItems} />

        {beheerItems.length > 0 && (
          <>
            <p className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-muted">Beheer</p>
            <AdminSidebarLinks items={beheerItems} />
          </>
        )}
      </nav>

      <LiveTeamledenActief initieel={online} />

      <div className="border-t border-line px-2 py-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface2"
        >
          <IconBekijkSite /> Bekijk site
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-surface2"
          >
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  );
}
