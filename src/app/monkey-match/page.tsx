import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { PreferenceFlow } from '@/components/monkey-match/PreferenceFlow';

export const metadata: Metadata = { title: 'Hitta din kväll | Monkey Match' };

export default function MonkeyMatchPage() {
  return <PageContainer className="match-page"><PreferenceFlow /></PageContainer>;
}
