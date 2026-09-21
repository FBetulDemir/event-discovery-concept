import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { PreferencesProvider } from '@/components/monkey-match/PreferencesProvider';
import { ShortlistProvider } from '@/components/plan/ShortlistProvider';

export const metadata: Metadata = {
  title: 'VIP Monkey | Designprototyp',
  description: 'Ett designkoncept för VIP Monkey.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <a className="skip-link" href="#main-content">Hoppa till innehåll</a>
        <PreferencesProvider>
          <ShortlistProvider>
            <Header />
            {children}
          </ShortlistProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
