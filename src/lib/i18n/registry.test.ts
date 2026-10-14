import { describe, expect, it } from 'vitest';

import {
  advertisedLanguagesIn,
  directionOf,
  isLanguageOfferedIn,
  isSupportedLanguage,
  languagesOfferedIn,
  scriptOf,
  SUPPORTED_LANGUAGES
} from './config';
import { LANGUAGES } from './registry';

describe('language registry', () => {
  it('serves every language that is not merely planned', () => {
    expect(SUPPORTED_LANGUAGES).toContain('en');
    expect(SUPPORTED_LANGUAGES).toContain('hi');
    SUPPORTED_LANGUAGES.forEach(code => {
      expect(LANGUAGES[code].status).not.toBe('planned');
    });
  });

  it('names every language in its own script', () => {
    expect(LANGUAGES.hi.endonym).toBe('हिन्दी');
    expect(LANGUAGES.sw.endonym).toBe('Kiswahili');
  });
});

describe('direction and script', () => {
  it('keeps Devanagari left-to-right', () => {
    // Hindi needs a different font, not a different layout.
    expect(directionOf('hi')).toBe('ltr');
    expect(scriptOf('hi')).toBe('devanagari');
  });

  it('falls back to left-to-right Latin for anything unknown', () => {
    expect(directionOf('zz')).toBe('ltr');
    expect(scriptOf('zz')).toBe('latin');
  });
});

describe('market coverage', () => {
  it('offers English everywhere', () => {
    ['in', 'ke', 'ma', 'pl', 'br'].forEach(market => {
      expect(isLanguageOfferedIn('en', market)).toBe(true);
    });
  });

  it('offers each trade language only where it is spoken', () => {
    expect(isLanguageOfferedIn('hi', 'in')).toBe(true);
    expect(isLanguageOfferedIn('hi', 'ke')).toBe(false);

    expect(isLanguageOfferedIn('sw', 'ke')).toBe(true);
    expect(isLanguageOfferedIn('sw', 'ma')).toBe(false);

    expect(isLanguageOfferedIn('pt', 'ao')).toBe(true);
    expect(isLanguageOfferedIn('pt', 'in')).toBe(false);
  });

  it('gives multilingual markets every language they trade in', () => {
    // Morocco trades in French and reads English.
    expect(languagesOfferedIn('ma').sort()).toEqual(['en', 'fr']);
    // Kenya trades in Swahili and English.
    expect(languagesOfferedIn('ke').sort()).toEqual(['en', 'sw']);
  });

  it('rejects languages we do not serve', () => {
    expect(isSupportedLanguage('de')).toBe(false);
    expect(isLanguageOfferedIn('de', 'de')).toBe(false);
  });
});

describe('advertising to search engines', () => {
  it('advertises only reviewed languages', () => {
    // Swahili is beta: served on request, never advertised.
    expect(languagesOfferedIn('ke')).toContain('sw');
    expect(advertisedLanguagesIn('ke')).not.toContain('sw');
  });

  it('still advertises the reviewed ones in the same market', () => {
    expect(advertisedLanguagesIn('ma').sort()).toEqual(['en', 'fr']);
  });

  it('advertises English in a market with nothing else reviewed', () => {
    expect(advertisedLanguagesIn('in')).toEqual(['en']);
  });
});
