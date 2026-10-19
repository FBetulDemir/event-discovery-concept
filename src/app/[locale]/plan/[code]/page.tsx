import { PageContainer } from '@/components/layout/PageContainer';
import { PlanRoom } from '@/components/plan/PlanRoom';
import { pageLocale, titleFor } from '@/i18n/page';

// Invite links are private: keep them out of search results.
export const generateMetadata = titleFor('plan', { robots: { index: false, follow: false } });

export default async function PlanRoomPage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  await pageLocale(params);
  const { code } = await params;
  return (
    <PageContainer>
      <PlanRoom code={code} />
    </PageContainer>
  );
}
