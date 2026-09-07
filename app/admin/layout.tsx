import AdminNav from '@/components/admin/AdminNav';

// Elke /admin-pagina moet bij elk verzoek opnieuw checken of setup/login
// geldig is (leest data/admin.json en cookies) — nooit statisch cachen,
// anders kan een build-time "nog geen setup"-redirect blijven hangen nadat
// iemand het wachtwoord wél heeft ingesteld.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Beheer',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg">
      <AdminNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10">{children}</main>
    </div>
  );
}
