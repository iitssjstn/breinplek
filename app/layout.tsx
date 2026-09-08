import type { Metadata } from 'next';
import Script from 'next/script';
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
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="nl">
      <body className="font-body flex min-h-screen flex-col bg-bg text-ink">
        {children}
        {adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
