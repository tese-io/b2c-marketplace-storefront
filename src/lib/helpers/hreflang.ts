/**
 * The language the storefront actually serves.
 *
 * The `[locale]` route segment carries a Medusa country code, not a language:
 * middleware resolves it from the region map and it drives shipping region and
 * currency only. Every region is therefore served in the same language until
 * translation catalogs exist.
 */
export const DEFAULT_CONTENT_LANGUAGE = 'en';

const REGION_CODE = /^[a-z]{2}$/i;

/**
 * Builds an hreflang tag for a region.
 *
 * The second subtag of an hreflang value is a *region*, not a language variant,
 * so `en-FR` correctly reads as "English copy targeted at users in France" —
 * which is what we serve. Emitting `fr-FR` would advertise French translations
 * that do not exist and cluster duplicate English pages under a language Google
 * would then serve to French searchers.
 *
 * Pass `language` explicitly once a region is genuinely translated.
 */
export const toHreflang = (
  countryCode: string,
  language: string = DEFAULT_CONTENT_LANGUAGE
): string => {
  if (!REGION_CODE.test(countryCode)) {
    return language;
  }

  return `${language}-${countryCode.toUpperCase()}`;
};

/**
 * The language of the page content, without a region subtag — for schema.org
 * `inLanguage` and the `lang` attribute, which describe the copy itself rather
 * than the audience it targets.
 */
export const toContentLanguage = (): string => DEFAULT_CONTENT_LANGUAGE;
