import { PageContainer } from '@/components/layout/PageContainer';
import { PreferenceFlow } from '@/components/match/PreferenceFlow';
import { pageLocale, titleFor, type LocaleParams } from '@/i18n/page';

export const generateMetadata = titleFor('match');

export default async function MatchPage({ params }: LocaleParams) {
  await pageLocale(params);
  return <PageContainer className="match-page"><PreferenceFlow /></PageContainer>;
}
