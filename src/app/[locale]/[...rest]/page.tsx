import { notFound } from 'next/navigation';

// Unknown URLs land here so they render the localized, layout-wrapped not-found page.
export default function CatchAll() {
  notFound();
}
