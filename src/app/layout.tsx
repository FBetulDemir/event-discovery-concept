import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monkey Match | VIP Monkey',
  description: 'Hitta din nästa kväll i Göteborg. Ett designkoncept för VIP Monkey.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="sv"><body>{children}</body></html>;
}
