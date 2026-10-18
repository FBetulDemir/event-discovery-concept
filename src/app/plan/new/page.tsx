import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewPlan } from '@/components/plan/NewPlan';

export const metadata: Metadata = { title: 'Ny plan' };

export default function NewPlanPage() {
  return (
    <PageContainer>
      <Suspense fallback={null}>
        <NewPlan />
      </Suspense>
    </PageContainer>
  );
}
