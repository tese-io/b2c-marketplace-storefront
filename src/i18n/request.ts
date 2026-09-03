import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/lib/i18n/config';
import { getLanguage } from '@/lib/i18n/locale';

type Messages = Record<string, unknown>;

/**
 * Fills gaps in `translated` from `base`, key by key.
 *
 * This is what lets a language ship incrementally: a catalog that covers the
 * header and homepage but not yet the checkout renders translated where it can
 * and English where it cannot, instead of throwing on the first missing key.
 * Translators can therefore land a language in slices.
 */
const withFallback = (base: Messages, translated: Messages): Messages => {
  const merged: Messages = { ...base };

  for (const [key, value] of Object.entries(translated)) {
    const fallback = merged[key];

    merged[key] =
      isPlainObject(value) && isPlainObject(fallback)
        ? withFallback(fallback, value)
        : value;
  }

  return merged;
};

const isPlainObject = (value: unknown): value is Messages =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const load = async (language: string): Promise<Messages> =>
  (await import(`../messages/${language}.json`)).default;

/**
 * Resolves the message catalog for a request.
 *
 * `requestLocale` arrives already reduced to a language when the locale layout
 * called `setRequestLocale`, but can still be a raw `{language}-{market}`
 * segment. Both are accepted — and a bare market like `fr` must not be mistaken
 * for the French language, which is why the supported-language check comes
 * first.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = (await requestLocale) ?? '';
  const language = isSupportedLanguage(requested)
    ? requested
    : getLanguage(requested) || DEFAULT_LANGUAGE;

  const base = await load(DEFAULT_LANGUAGE);

  return {
    locale: language,
    messages: language === DEFAULT_LANGUAGE ? base : withFallback(base, await load(language))
  };
});
