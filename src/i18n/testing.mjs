import { createTranslator } from 'next-intl';
import sv from '../../messages/sv.json' with { type: 'json' };
import en from '../../messages/en.json' with { type: 'json' };

export const messages = { sv, en };

/** A root translator over the real messages, the same shape `useTranslations()` returns. */
export const translatorFor = locale => createTranslator({ locale, messages: messages[locale] });
