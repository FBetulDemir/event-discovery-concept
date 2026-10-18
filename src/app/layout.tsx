import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Anton, Work_Sans } from 'next/font/google';
import '@/styles/index.css';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Footer } from '@/components/layout/Footer';
import { PreferencesProvider } from '@/components/match/PreferencesProvider';
import { RevealObserver } from '@/components/ui/Reveal';

const anton = Anton({ weight: '400', subsets: ['latin', 'latin-ext'], variable: '--font-anton', display: 'swap' });
const workSans = Work_Sans({ weight: ['400', '600'], subsets: ['latin', 'latin-ext'], variable: '--font-work-sans', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Gänget: vad gör vi ikväll?', template: '%s | Gänget' },
  description: 'Hitta kvällen i Göteborg, låt gänget rösta och köp biljetterna hos säljaren.',
};

// Marks the document as script-enabled before first paint, so entrance animations only hide
// content when they can also reveal it.
const enableScript = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv" data-theme="dark" className={`${anton.variable} ${workSans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Hoppa till innehåll</a>
        <RevealObserver />
        <PreferencesProvider>
          <Header />
          {children}
          <Footer />
          <BottomNav />
        </PreferencesProvider>
      </body>
    </html>
  );
}
