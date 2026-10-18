import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PlanRoom } from '@/components/plan/PlanRoom';

// Invite links are private: keep them out of search results.
export const metadata: Metadata = { title: 'Plan', robots: { index: false, follow: false } };

export default async function PlanRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return (
    <PageContainer>
      <PlanRoom code={code} />
    </PageContainer>
  );
}
