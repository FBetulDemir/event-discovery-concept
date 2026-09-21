import { Info } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeading } from '@/components/ui/SectionHeading';

export default function HomePage() {
  return (
    <PageContainer className="foundation-page">
      <SectionHeading as="h1" eyebrow="VIP Monkey" title="Fler kvällar att minnas." />
      <p className="foundation-copy">Grunden till en ny upplevelse.</p>
      <p className="prototype-note">
        <Info size={16} aria-hidden="true" />
        Designprototyp under utveckling.
      </p>
    </PageContainer>
  );
}
