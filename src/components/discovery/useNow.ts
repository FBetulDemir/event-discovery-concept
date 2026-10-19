'use client';

import { useEffect, useState } from 'react';

/** ISO instant taken after mount (null on the server and first render: hydration safe). */
export function useNow(): string | null {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(new Date().toISOString());
    const interval = window.setInterval(() => setNow(new Date().toISOString()), 60_000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}
