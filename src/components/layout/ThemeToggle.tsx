'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

const KEY = 'ganget-theme';
type Theme = 'dark' | 'light';

/** Dark is the default; a choice is remembered on this device only (a convenience, never required). */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { window.localStorage.setItem(KEY, next); } catch { /* storage can be unavailable */ }
  }

  return (
    <IconButton label={theme === 'dark' ? 'Byt till ljust tema' : 'Byt till mörkt tema'} onClick={toggle}>
      {theme === 'dark' ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </IconButton>
  );
}
