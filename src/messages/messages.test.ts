import { describe, expect, it } from 'vitest';

import { LANGUAGES, SUPPORTED_LANGUAGES } from '@/lib/i18n/config';

import en from './en.json';
import fr from './fr.json';
import hi from './hi.json';
import pt from './pt.json';
import sw from './sw.json';

const catalogs: Record<string, unknown> = { en, fr, hi, pt, sw };

/** Every leaf key, dot-joined — `hero.proof.verifiedListings`. */
const leafKeys = (value: unknown, prefix = ''): string[] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([key, child]) => leafKeys(child, `${prefix}${key}.`))
    : [prefix.slice(0, -1)];

const REFERENCE = leafKeys(en).sort();

describe('message catalogs', () => {
  it('ships a catalog for every language we serve', () => {
    SUPPORTED_LANGUAGES.forEach(language => {
      expect(catalogs[language], `missing catalog for "${language}"`).toBeDefined();
    });
  });

  it('keeps reviewed languages complete', () => {
    // A `ga` language is advertised to search engines, so every key must be
    // genuinely translated — falling back to English on an advertised page
    // would be the same broken promise as a wrong hreflang.
    SUPPORTED_LANGUAGES.filter(language => LANGUAGES[language].status === 'ga').forEach(
      language => {
        expect(leafKeys(catalogs[language]).sort(), `"${language}" is incomplete`).toEqual(
          REFERENCE
        );
      }
    );
  });

  it('lets unreviewed languages be partial', () => {
    // Beta catalogs land in slices and fall back to English per key at runtime,
    // so they only have to be a subset — never a superset.
    SUPPORTED_LANGUAGES.filter(language => LANGUAGES[language].status === 'beta').forEach(
      language => {
        const unknown = leafKeys(catalogs[language]).filter(key => !REFERENCE.includes(key));

        expect(unknown, `"${language}" has keys English does not define`).toEqual([]);
      }
    );
  });

  it('leaves no message empty', () => {
    Object.entries(catalogs).forEach(([language, catalog]) => {
      const empty = leafKeys(catalog).filter(
        key => !String(key.split('.').reduce<any>((node, part) => node?.[part], catalog) ?? '').trim()
      );

      expect(empty, `"${language}" has empty messages`).toEqual([]);
    });
  });
});
