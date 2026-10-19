import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewPlan } from '@/components/plan/NewPlan';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';

export const generateMetadata = titleFor('newPlan');

export default async function NewPlanPage({ params }: LocaleParams) {
  await pageLocale(params);
  return (
    <PageContainer>
      <Suspense fallback={null}>
        <NewPlan />
      </Suspense>
    </PageContainer>
  );
}
