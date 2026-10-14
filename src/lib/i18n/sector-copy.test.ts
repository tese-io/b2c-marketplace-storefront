import { describe, expect, it } from 'vitest';

import { SECTORS } from '@/data/sectors';

import en from '../../messages/en.json';

const catalog = en.sectors as Record<string, Record<string, unknown>>;

describe('sector copy catalog', () => {
  it('covers every sector', () => {
    expect(Object.keys(catalog).sort()).toEqual(SECTORS.map(s => s.id).sort());
  });

  it('matches the English copy in sectors.ts exactly', () => {
    // `sectors.ts` stays the structural source and the catalogs are keyed from
    // it, so the two must agree. Drift here means English readers and everyone
    // else see different words for the same sector.
    SECTORS.forEach(sector => {
      const entry = catalog[sector.id];

      expect(entry.label, `${sector.id}.label`).toBe(sector.label);
      expect(entry.shortLabel, `${sector.id}.shortLabel`).toBe(sector.shortLabel);
      expect(entry.headline, `${sector.id}.headline`).toBe(sector.headline);
      expect(entry.subheadline, `${sector.id}.subheadline`).toBe(sector.subheadline);
      expect(entry.explorerIntro, `${sector.id}.explorerIntro`).toBe(sector.explorerIntro);
      expect(entry.topicTags, `${sector.id}.topicTags`).toEqual(sector.topicTags);
    });
  });
});
