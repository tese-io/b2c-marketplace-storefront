import { describe, expect, it } from 'vitest';

import { buildLanguageAlternates } from './alternates';

describe('buildLanguageAlternates', () => {
  it('emits one entry per language actually served in each market', () => {
    expect(buildLanguageAlternates(['fr', 'pl'], 'https://x.io')).toEqual({
      'en-FR': 'https://x.io/en-fr',
      'fr-FR': 'https://x.io/fr-fr',
      'en-PL': 'https://x.io/en-pl'
    });
  });

  it('never advertises a language a market does not get', () => {
    const alternates = buildLanguageAlternates(['pl', 'de', 'se'], 'https://x.io');

    expect(Object.keys(alternates)).toEqual(['en-PL', 'en-DE', 'en-SE']);
  });

  it('never advertises an unreviewed translation', () => {
    // Swahili is served in Kenya but still beta, so search engines are told
    // only about the reviewed languages there.
    expect(Object.keys(buildLanguageAlternates(['ke'], 'https://x.io'))).toEqual(['en-KE']);
  });

  it('advertises nothing extra for a market whose only language is beta', () => {
    expect(buildLanguageAlternates(['in'], 'https://x.io')).toEqual({
      'en-IN': 'https://x.io/en-in'
    });
  });

  it('appends the page path to every alternate', () => {
    expect(buildLanguageAlternates(['be'], 'https://x.io', '/categories')).toEqual({
      'en-BE': 'https://x.io/en-be/categories',
      'fr-BE': 'https://x.io/fr-be/categories'
    });
  });

  it('returns nothing for no markets', () => {
    expect(buildLanguageAlternates([], 'https://x.io')).toEqual({});
  });
});
