import { describe, expect, it } from 'vitest';

import { DEFAULT_CONTENT_LANGUAGE, toContentLanguage, toHreflang } from './hreflang';

describe('toHreflang', () => {
  it('does not claim a French page for the French region', () => {
    // The `[locale]` segment is a Medusa country code. `/fr` serves English
    // copy, so advertising `fr-FR` would point Google at translations we
    // do not have.
    expect(toHreflang('fr')).toBe('en-FR');
  });

  it('tags English-speaking regions with their region subtag', () => {
    expect(toHreflang('us')).toBe('en-US');
    expect(toHreflang('gb')).toBe('en-GB');
  });

  it('tags non-English regions as English targeted at that region', () => {
    expect(toHreflang('pl')).toBe('en-PL');
    expect(toHreflang('de')).toBe('en-DE');
    expect(toHreflang('br')).toBe('en-BR');
  });

  it('normalises casing so the region subtag is upper case', () => {
    expect(toHreflang('PL')).toBe('en-PL');
    expect(toHreflang('Fr')).toBe('en-FR');
  });

  it('accepts an explicit content language once translations exist', () => {
    expect(toHreflang('fr', 'fr')).toBe('fr-FR');
    expect(toHreflang('be', 'fr')).toBe('fr-BE');
  });

  it('falls back to the bare language for codes that are not regions', () => {
    expect(toHreflang('')).toBe('en');
    expect(toHreflang('not-a-country')).toBe('en');
  });
});

describe('toContentLanguage', () => {
  it('reports the language actually served, without a region subtag', () => {
    expect(toContentLanguage()).toBe('en');
    expect(toContentLanguage()).toBe(DEFAULT_CONTENT_LANGUAGE);
  });
});
