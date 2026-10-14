import { describe, expect, it } from 'vitest';

import { isLanguageOfferedIn, languagesOfferedIn } from './config';
import { formatLocale, getCountryCode, getLanguage, parseLocale } from './locale';

describe('parseLocale', () => {
  it('splits a composite segment into language and market', () => {
    expect(parseLocale('fr-be')).toEqual({ language: 'fr', countryCode: 'be' });
    expect(parseLocale('en-fr')).toEqual({ language: 'en', countryCode: 'fr' });
  });

  it('reads a bare segment as a market in the default language', () => {
    // Legacy URLs: `/fr` always meant "ship to France", never "in French".
    expect(parseLocale('fr')).toEqual({ language: 'en', countryCode: 'fr' });
    expect(parseLocale('pl')).toEqual({ language: 'en', countryCode: 'pl' });
  });

  it('normalises casing', () => {
    expect(parseLocale('FR-BE')).toEqual({ language: 'fr', countryCode: 'be' });
    expect(parseLocale('PL')).toEqual({ language: 'en', countryCode: 'pl' });
  });

  it('falls back to the default language when the language is not supported', () => {
    // `de-fr` would claim German copy we do not have; serve English instead.
    expect(parseLocale('de-fr')).toEqual({ language: 'en', countryCode: 'fr' });
  });

  it('falls back to the default language when the pair is not offered', () => {
    // French is not offered to the Polish market.
    expect(parseLocale('fr-pl')).toEqual({ language: 'en', countryCode: 'pl' });
  });

  it('returns no market for input that is not a locale segment', () => {
    expect(parseLocale('')).toEqual({ language: 'en', countryCode: '' });
    expect(parseLocale('categories')).toEqual({ language: 'en', countryCode: '' });
  });
});

describe('formatLocale', () => {
  it('joins language and market', () => {
    expect(formatLocale('fr', 'be')).toBe('fr-be');
    expect(formatLocale('en', 'pl')).toBe('en-pl');
  });

  it('lower-cases both halves so URLs stay canonical', () => {
    expect(formatLocale('FR', 'BE')).toBe('fr-be');
  });
});

describe('getCountryCode / getLanguage', () => {
  it('extracts each axis independently', () => {
    expect(getCountryCode('fr-be')).toBe('be');
    expect(getLanguage('fr-be')).toBe('fr');
  });

  it('keeps legacy bare segments working as markets', () => {
    expect(getCountryCode('pl')).toBe('pl');
    expect(getLanguage('pl')).toBe('en');
  });
});

describe('language availability', () => {
  it('offers English everywhere', () => {
    expect(isLanguageOfferedIn('en', 'pl')).toBe(true);
    expect(isLanguageOfferedIn('en', 'fr')).toBe(true);
  });

  it('offers French only where it is spoken', () => {
    expect(isLanguageOfferedIn('fr', 'fr')).toBe(true);
    expect(isLanguageOfferedIn('fr', 'be')).toBe(true);
    expect(isLanguageOfferedIn('fr', 'pl')).toBe(false);
    expect(isLanguageOfferedIn('fr', 'de')).toBe(false);
  });

  it('rejects languages we do not serve at all', () => {
    expect(isLanguageOfferedIn('de', 'de')).toBe(false);
  });

  it('lists the languages a market gets, default first', () => {
    expect(languagesOfferedIn('fr')).toEqual(['en', 'fr']);
    expect(languagesOfferedIn('pl')).toEqual(['en']);
  });
});
