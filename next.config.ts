import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Routes renamed in the Gänget redesign; keep old links working (in both languages).
  async redirects() {
    return [
      { source: '/monkey-match', destination: '/match', permanent: true },
      { source: '/matches', destination: '/match/results', permanent: true },
      { source: '/en/monkey-match', destination: '/en/match', permanent: true },
      { source: '/en/matches', destination: '/en/match/results', permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
