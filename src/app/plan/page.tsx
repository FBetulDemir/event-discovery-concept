import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PlansList } from '@/components/plan/PlansList';

export const metadata: Metadata = { title: 'Dina planer | Monkey Match' };

export default function PlanPage() {
  return (
    <PageContainer>
      <PlansList />
    </PageContainer>
  );
}
