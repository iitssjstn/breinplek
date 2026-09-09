import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VisitorHeartbeat from '@/components/VisitorHeartbeat';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VisitorHeartbeat />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
