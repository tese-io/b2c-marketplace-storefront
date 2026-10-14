import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { getSectorById, type SectorDefinition, type SectorId } from '@/data/sectors';

/**
 * Returns a sector with its copy translated.
 *
 * `src/data/sectors.ts` stays the structural source — ids, category handles,
 * and the English copy that the catalogs are keyed from. This swaps the display
 * fields for the visitor's language while keeping the object shape identical,
 * so every component that already takes a `SectorDefinition` keeps working
 * unchanged.
 *
 * Copy that has not been translated falls back to English per key, the same way
 * the rest of the catalogs do.
 */
type Translator = {
  (key: string): string;
  raw: (key: string) => unknown;
};

const translate = (t: Translator, sector: SectorDefinition): SectorDefinition => {
  const tags = t.raw(`${sector.id}.topicTags`);

  return {
    ...sector,
    label: t(`${sector.id}.label`),
    shortLabel: t(`${sector.id}.shortLabel`),
    headline: t(`${sector.id}.headline`),
    subheadline: t(`${sector.id}.subheadline`),
    explorerIntro: t(`${sector.id}.explorerIntro`),
    topicTags: Array.isArray(tags) ? (tags as string[]) : sector.topicTags
  };
};

/** Server components. */
export const getTranslatedSector = async (id: SectorId | string): Promise<SectorDefinition> =>
  translate((await getTranslations('sectors')) as unknown as Translator, getSectorById(id));

/** Client components. */
export const useTranslatedSector = (id: SectorId | string): SectorDefinition =>
  translate(useTranslations('sectors') as unknown as Translator, getSectorById(id));

/** Server components that render the whole list. */
export const getTranslatedSectors = async (
  sectors: SectorDefinition[]
): Promise<SectorDefinition[]> => {
  const t = (await getTranslations('sectors')) as unknown as Translator;

  return sectors.map(sector => translate(t, sector));
};

/** Client components that render the whole list — nav menus, tabs, pills. */
export const useTranslatedSectors = (sectors: SectorDefinition[]): SectorDefinition[] => {
  const t = useTranslations('sectors') as unknown as Translator;

  return sectors.map(sector => translate(t, sector));
};
