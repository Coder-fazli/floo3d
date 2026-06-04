import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // English: /   Arabic: /ar/
  localeCookie: false,        // pure URL-based switching, no cookie interference
});
