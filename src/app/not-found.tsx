import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = { title: 'Sidan finns inte' };

export default function NotFound() {
  return (
    <PageContainer>
      <div className="page plan enter">
        <h1 className="head">Den här sidan finns inte</h1>
        <p className="lead muted measure">Länken kan vara fel, eller så har eventet försvunnit från säljaren.</p>
        <ButtonLink href="/">Till startsidan</ButtonLink>
      </div>
    </PageContainer>
  );
}
