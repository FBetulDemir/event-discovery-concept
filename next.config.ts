import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Routes renamed in the Gänget redesign; keep old links working.
  async redirects() {
    return [
      { source: '/monkey-match', destination: '/match', permanent: true },
      { source: '/matches', destination: '/match/results', permanent: true },
    ];
  },
};

export default nextConfig;