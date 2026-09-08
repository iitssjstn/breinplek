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

// Zet het thema vóór React rendert, anders flitst de pagina eerst licht op
// en springt daarna naar donker. Alleen voor de publieke site relevant --
// het adminpaneel staat sowieso vast op donker (zie app/admin/layout.tsx).
const themaScript = `
(function () {
  try {
    var opgeslagen = localStorage.getItem('breinplek-thema');
    var wilDonker = opgeslagen === 'donker';
    if (!opgeslagen && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      wilDonker = true;
    }
    if (wilDonker) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="nl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themaScript }} />
      </head>
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
