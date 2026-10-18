'use client';

import { useEffect } from 'react';

/**
 * Reveals [data-reveal] elements as they enter the viewport (a stagger comes from --i).
 * Mounted once in the layout. Content is visible by default; CSS only hides it while this runs.
 */
export function RevealObserver() {
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    const scan = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]:not(.is-in)').forEach(element => {
        if (!seen.has(element)) {
          seen.add(element);
          io.observe(element);
        }
      });
    };
    scan(document);
    const mo = new MutationObserver(() => scan(document));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
  return null;
}
