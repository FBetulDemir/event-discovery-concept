import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Route destination only. The preference flow belongs to the next implementation step. */
export default function MonkeyMatchPage() {
  return <PageContainer className="foundation-page"><SectionHeading as="h1" eyebrow="KOMMER SNART" title="Monkey Match" /><p className="foundation-copy">Din kväll, på ditt sätt. Matchningsflödet kommer i nästa del av prototypen.</p><Link href="/" className="text-link"><ArrowLeft size={18} aria-hidden="true" />Tillbaka till alla event</Link></PageContainer>;
}
