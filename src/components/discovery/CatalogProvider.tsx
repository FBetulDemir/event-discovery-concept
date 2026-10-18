'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Catalog } from '@/lib/events/catalog';
import { useCatalog } from '@/lib/useEvents';

type Value = Catalog & { loading: boolean };
const CatalogContext = createContext<Value | null>(null);

/**
 * One catalogue for the whole home page: server-rendered first (real events in the first HTML,
 * no flash), then refreshed in the browser on focus and every few minutes.
 */
export function CatalogProvider({ initial, children }: { initial: Catalog; children: ReactNode }) {
  const catalog = useCatalog(initial);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useHomeCatalog(): Value {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('useHomeCatalog requires CatalogProvider');
  return value;
}
