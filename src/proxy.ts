import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next 16 calls this file `proxy.ts` (it was `middleware.ts`).
const intlMiddleware = createMiddleware(routing);

/**
 * `localeDetection` makes next-intl read the NEXT_LOCALE cookie (the only way it honours a remembered
 * choice for unprefixed URLs), but it would also fall back to Accept-Language. We want the cookie
 * and nothing else (D-022): a shared Swedish link must never redirect because of the browser's
 * language. So the header is removed before next-intl sees the request.
 */
export default function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete('accept-language');
  return intlMiddleware(new NextRequest(request, { headers }));
}

export const config = {
  // Everything except the API, Next internals and files with an extension (icon.svg, images).
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
