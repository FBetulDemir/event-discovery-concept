import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PlanExperience } from '@/components/plan/PlanExperience';

export const metadata: Metadata = { title: 'Planera med vänner | Monkey Match' };

export default function PlanPage() {
  return (
    <PageContainer>
      <Suspense fallback={null}>
        <PlanExperience />
      </Suspense>
    </PageContainer>
  );
}
