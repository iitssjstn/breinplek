import type { Metadata } from 'next';
import './globals.css';

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
      <body className="font-body flex min-h-screen flex-col bg-bg text-ink">{children}</body>
    </html>
  );
}
