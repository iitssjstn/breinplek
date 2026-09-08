import AdminSidebar from '@/components/admin/AdminSidebar';

// Elke /admin-pagina moet bij elk verzoek opnieuw checken of setup/login
// geldig is (leest data/users.json en cookies) — nooit statisch cachen,
// anders kan een build-time "nog geen setup"-redirect blijven hangen nadat
// iemand wél een account heeft aangemaakt.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Beheer',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Het adminpaneel staat vast op donker thema, los van de licht/donker-
    // schakelaar op de publieke site (die zet "dark" op <html>, dit zet het
    // hier apart op deze wrapper, dus onafhankelijk van elkaar).
    <div className="dark flex min-h-screen flex-1 flex-col bg-bg text-ink md:flex-row">
      <AdminSidebar />
      <main className="w-full flex-1 px-5 py-10 md:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
