import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/** Locale-aware drop-ins for next/link and next/navigation. Import these, never the Next originals. */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
