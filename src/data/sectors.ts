export type SectorId =
  | 'all'
  | 'industrial-materials'
  | 'construction'
  | 'energy'
  | 'textiles'

export type SectorDefinition = {
  id: SectorId
  label: string
  shortLabel: string
  headline: string
  subheadline: string
  /** Bootstrap fallback when category.metadata.sector_tags is empty */
  categoryHandles: string[]
}

export const SECTORS: SectorDefinition[] = [
  {
    id: 'all',
    label: 'All sectors',
    shortLabel: 'All',
    headline: 'Source sustainable materials across every sector',
    subheadline:
      'Compare vetted suppliers on tese.io with certification data, embodied carbon, and AI discovery — personalise by sector to focus your browse experience.',
    categoryHandles: [],
  },
  {
    id: 'industrial-materials',
    label: 'Industrial materials',
    shortLabel: 'Industrial',
    headline: 'Source low-carbon metals, polymers & chemicals',
    subheadline:
      'Recycled and certified industrial inputs for mills and manufacturers — mill certificates, MOQs, and traceability on tese.io.',
    categoryHandles: [
      'metals-&-alloys',
      'recycled-materials',
      'polymers-&-plastics',
      'industrial-chemicals',
    ],
  },
  {
    id: 'construction',
    label: 'Construction & infrastructure',
    shortLabel: 'Construction',
    headline: 'Source greener construction & packaging inputs',
    subheadline:
      'Low-carbon and circular materials for builders and infrastructure — quoted with certification evidence on tese.io.',
    categoryHandles: ['construction-materials', 'packaging'],
  },
  {
    id: 'energy',
    label: 'Energy & renewables',
    shortLabel: 'Energy',
    headline: 'Source renewable energy components',
    subheadline:
      'Solar, storage, and clean-energy inputs from vetted suppliers — accelerate your transition on tese.io.',
    categoryHandles: ['renewable-energy'],
  },
  {
    id: 'textiles',
    label: 'Textiles & fibres',
    shortLabel: 'Textiles',
    headline: 'Source responsible yarns, fibres & textiles',
    subheadline:
      'Recycled and certified textile inputs with full chain-of-custody traceability — sourced through tese.io.',
    categoryHandles: ['textiles-&-fibres'],
  },
]

export const DEFAULT_SECTOR_ID: SectorId = 'all'

export function getSectorById(id?: string | null): SectorDefinition {
  return SECTORS.find((s) => s.id === id) || SECTORS[0]
}

export function sectorIncludesCategory(
  sector: SectorDefinition,
  categoryHandle: string
): boolean {
  if (sector.id === 'all' || !sector.categoryHandles.length) return true
  return sector.categoryHandles.includes(categoryHandle)
}
