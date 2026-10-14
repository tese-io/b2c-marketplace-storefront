import { toHreflang } from '@/lib/helpers/hreflang';

import { advertisedLanguagesIn } from './config';
import { formatLocale } from './locale';

/**
 * Builds the `alternates.languages` map for a page.
 *
 * One entry per language/market pair we actually serve *and have reviewed* —
 * never the full cross-product. Advertising `fr-PL` because Poland is a market
 * and French is a language would point search engines at a page that does not
 * exist, which is the bug this replaced. Unreviewed (`beta`) languages are
 * served on request but deliberately left out here.
 */
export const buildLanguageAlternates = (
  markets: string[],
  baseUrl: string,
  path = ''
): Record<string, string> =>
  markets.reduce<Record<string, string>>((alternates, market) => {
    advertisedLanguagesIn(market).forEach(language => {
      alternates[toHreflang(market, language)] =
        `${baseUrl}/${formatLocale(language, market)}${path}`;
    });

    return alternates;
  }, {});
