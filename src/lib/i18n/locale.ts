import { DEFAULT_LANGUAGE, isLanguageOfferedIn, isSupportedLanguage } from './config';

export type Locale = {
  /** The language the page is served in. */
  language: string;
  /** The Medusa country code driving region, shipping and currency. */
  countryCode: string;
};

const CODE = /^[a-z]{2}$/;

/**
 * Reads a `[locale]` route segment into its two axes.
 *
 * Accepts both the composite form (`fr-be`) and the legacy bare form (`fr`),
 * which always denoted a market rather than a language. Anything we do not
 * actually serve — an unknown language, or a language/market pair we do not
 * offer — degrades to the default language rather than 404ing, so a hand-typed
 * URL still renders something truthful.
 */
export const parseLocale = (segment: string): Locale => {
  const normalised = (segment || '').toLowerCase();
  const [first, second] = normalised.split('-');

  // Composite: `{language}-{market}`.
  if (CODE.test(first) && CODE.test(second ?? '')) {
    const offered = isSupportedLanguage(first) && isLanguageOfferedIn(first, second);

    return { language: offered ? first : DEFAULT_LANGUAGE, countryCode: second };
  }

  // Legacy bare market segment.
  if (CODE.test(first) && second === undefined) {
    return { language: DEFAULT_LANGUAGE, countryCode: first };
  }

  return { language: DEFAULT_LANGUAGE, countryCode: '' };
};

/** Builds the canonical `[locale]` segment for a language/market pair. */
export const formatLocale = (language: string, countryCode: string): string =>
  `${language.toLowerCase()}-${countryCode.toLowerCase()}`;

/** The market half of a segment — what every region-aware data call needs. */
export const getCountryCode = (segment: string): string => parseLocale(segment).countryCode;

/** The language half of a segment — what the message catalog is keyed on. */
export const getLanguage = (segment: string): string => parseLocale(segment).language;
