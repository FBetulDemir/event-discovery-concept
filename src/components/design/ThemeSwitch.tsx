'use client';

import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';

/** Gallery-only: flips data-theme on <html> so both themes can be checked. Not persisted. */
export function ThemeSwitch() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const choose = (next: 'dark' | 'light') => {
    document.documentElement.dataset.theme = next;
    setTheme(next);
  };
  return (
    <div className="design__theme" role="group" aria-label="Tema">
      <Chip selected={theme === 'dark'} onClick={() => choose('dark')}>Mörkt (standard)</Chip>
      <Chip selected={theme === 'light'} onClick={() => choose('light')}>Ljust</Chip>
    </div>
  );
}
