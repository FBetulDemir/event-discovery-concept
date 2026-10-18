import { PageContainer } from '@/components/layout/PageContainer';
import { PlansList } from '@/components/plan/PlansList';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';

export const generateMetadata = titleFor('plans');

export default async function PlanPage({ params }: LocaleParams) {
  await pageLocale(params);
  return (
    <PageContainer>
      <PlansList />
    </PageContainer>
  );
}
