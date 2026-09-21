import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { ResultExperience } from '@/components/plan/ResultExperience';

export const metadata: Metadata = { title: 'Vi har en vinnare | Monkey Match' };

export default function PlanResultPage() {
  return (
    <PageContainer>
      <ResultExperience />
    </PageContainer>
  );
}
