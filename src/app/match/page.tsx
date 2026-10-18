import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PreferenceFlow } from '@/components/match/PreferenceFlow';

export const metadata: Metadata = { title: 'Hitta din kväll' };

export default function MatchPage() {
  return <PageContainer className="match-page"><PreferenceFlow /></PageContainer>;
}
