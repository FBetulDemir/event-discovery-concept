import { loadCatalog } from '@/lib/events/catalog';
import { PageContainer } from '@/components/layout/PageContainer';
import { CatalogProvider } from '@/components/discovery/CatalogProvider';
import { HeroSentence } from '@/components/discovery/HeroSentence';
import { TonightList } from '@/components/discovery/TonightList';
import { HowItWorks } from '@/components/discovery/HowItWorks';
import { EventDiscovery } from '@/components/discovery/EventDiscovery';
import { ClosingCta } from '@/components/discovery/ClosingCta';
import { pageLocale, type LocaleParams } from '@/i18n/page';

// Real events change at their sources: render per request (the sources are cached for 10 minutes).
export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: LocaleParams) {
  await pageLocale(params);
  const catalog = await loadCatalog();
  return (
    <PageContainer className="home">
      <CatalogProvider initial={catalog}>
        <HeroSentence />
        <TonightList />
        <HowItWorks />
        <EventDiscovery />
        <ClosingCta />
      </CatalogProvider>
    </PageContainer>
  );
}
