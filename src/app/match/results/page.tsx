import type { Metadata } from 'next';
import { PageContainer } from '@/components/layout/PageContainer';
import { MatchResults } from '@/components/match/MatchResults';

export const metadata: Metadata = { title: 'Dina matchningar' };

export default function MatchResultsPage() {
  return <PageContainer className="results-page"><MatchResults /></PageContainer>;
}
