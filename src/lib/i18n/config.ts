/**
 * Language and market are independent axes.
 *
 * The URL carries both in a single segment shaped `{language}-{market}`, e.g.
 * `/en-fr` (English copy, ships to France) or `/sw-ke` (Swahili copy, ships to
 * Kenya). The market half drives the Medusa region — shipping and currency.
 * The language half selects the message catalog, the font subset, and the text
 * direction.
 *
 * Everything here is derived from `registry.ts`. To add a language, edit the
 * registry — not this file.
 */

import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  SCRIPT_DIRECTION,
  type Direction,
  type LanguageStatus,
  type Script,
  type SupportedLanguage
} from './registry';

export {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  SCRIPT_DIRECTION,
  type Direction,
  type LanguageStatus,
  type Script,
  type SupportedLanguage
};

/**
 * Header the middleware uses to hand the resolved language to the root layout,
 * which sits above `[locale]` and so cannot read the route param itself.
 */
export const LANGUAGE_HEADER = 'x-tese-language';

const CODES = Object.keys(LANGUAGES) as SupportedLanguage[];

/** Every language we serve at all — `planned` ones excluded. */
export const SUPPORTED_LANGUAGES = CODES.filter(
  code => LANGUAGES[code].status !== 'planned'
);

/** Names in each language's own script, for the switcher. */
export const LANGUAGE_NAMES = Object.fromEntries(
  CODES.map(code => [code, LANGUAGES[code].endonym])
) as Record<SupportedLanguage, string>;

export const isSupportedLanguage = (value: string): value is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as string[]).includes(value);

/** Reading direction for a language, from its script. */
export const directionOf = (language: string): Direction =>
  isSupportedLanguage(language) ? SCRIPT_DIRECTION[LANGUAGES[language].script] : 'ltr';

/** Writing system for a language, which decides the font subset. */
export const scriptOf = (language: string): Script =>
  isSupportedLanguage(language) ? LANGUAGES[language].script : 'latin';

/**
 * Whether we serve `language` to `countryCode`. Drives which hreflang tags we
 * emit and which options the language switcher offers, so that we never claim a
 * page that does not exist.
 */
export const isLanguageOfferedIn = (language: string, countryCode: string): boolean => {
  if (!isSupportedLanguage(language)) {
    return false;
  }

  const { markets } = LANGUAGES[language];

  return markets === 'all' || markets.includes(countryCode.toLowerCase());
};

/** The languages offered in a market, default language first. */
export const languagesOfferedIn = (countryCode: string): SupportedLanguage[] =>
  SUPPORTED_LANGUAGES.filter(language => isLanguageOfferedIn(language, countryCode));

/**
 * Languages we are willing to advertise to search engines — reviewed ones only.
 *
 * A `beta` translation is served to anyone who asks for it, but pointing Google
 * at it would send buyers to copy nobody has signed off.
 */
export const advertisedLanguagesIn = (countryCode: string): SupportedLanguage[] =>
  languagesOfferedIn(countryCode).filter(language => LANGUAGES[language].status === 'ga');
