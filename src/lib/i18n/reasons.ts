import type { Reason } from '../matching.ts';
import { formatKm } from '../format.ts';
import { intlLocale, type Locale, type Translator } from './locale.ts';

/** Stable React key for a reason (no two reasons of one result are identical). */
export const reasonKey = (reason: Reason): string =>
  reason.kind === 'mood' ? `mood:${reason.mood}` : reason.kind;

/**
 * A matching reason as a sentence in the visitor's language. `t` is the root translator. Every
 * sentence states a fact about the event against what the visitor chose (docs/CONTRACTS.md §3);
 * there are no scores and no percentages.
 */
export function describeReason(reason: Reason, t: Translator, locale: Locale): string {
  switch (reason.kind) {
    case 'mood': return t('reasons.mood', { mood: t(`moods.${reason.mood}`) });
    case 'withinBudget': return t('reasons.withinBudget');
    case 'free': return t('reasons.free');
    case 'priceUnknown': return t('reasons.priceUnknown');
    case 'distance': return t('reasons.distance', { km: formatKm(reason.km, locale) });
    case 'inRange': return t('reasons.inRange');
    case 'when': {
      if (reason.when !== 'date') return t(`reasons.${reason.when}`);
      const date = new Intl.DateTimeFormat(intlLocale(locale), {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
      }).format(new Date(`${reason.date}T12:00:00Z`));
      return t('reasons.date', { date, time: reason.time });
    }
  }
}
