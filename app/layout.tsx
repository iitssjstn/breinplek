import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Breinplek.nl — praktische hulp bij ADHD en autisme',
    template: '%s — Breinplek.nl',
  },
  description:
    'Praktische tips, uitleg en antwoorden op vragen voor mensen met ADHD, autisme of AuDHD.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="font-body flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
