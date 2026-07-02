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
  /** Longer intro for catalogue hero and mega-menu context */
  explorerIntro: string
  /** Topic chips for discovery filters and PDP context */
  topicTags: string[]
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
    explorerIntro:
      'Search and filter across industrial materials, construction, energy, and textiles — one catalogue for certified, low-carbon procurement.',
    topicTags: [
      'Circular economy',
      'Embodied carbon',
      'Chain of custody',
      'Recycled content',
    ],
    categoryHandles: [],
  },
  {
    id: 'industrial-materials',
    label: 'Industrial materials',
    shortLabel: 'Industrial',
    headline: 'Source low-carbon metals, polymers & chemicals',
    subheadline:
      'Recycled and certified industrial inputs for mills and manufacturers — mill certificates, MOQs, and traceability on tese.io.',
    explorerIntro:
      'Procurement teams use this sector for metals, polymers, chemicals, and circular feedstocks — with ASI, GRS, and mill-test evidence where suppliers disclose it.',
    topicTags: [
      'Recycled metals',
      'Post-consumer polymers',
      'Mill certificates',
      'Scope 3 inputs',
      'Circular manufacturing',
    ],
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
    explorerIntro:
      'Builders and infrastructure buyers source cement alternatives, structural materials, and packaging here — prioritising EPDs, embodied carbon, and regional supply.',
    topicTags: [
      'Low-carbon cement',
      'Circular packaging',
      'Embodied carbon',
      'Infrastructure',
      'EPD-backed materials',
    ],
    categoryHandles: ['construction-materials', 'packaging'],
  },
  {
    id: 'energy',
    label: 'Energy & renewables',
    shortLabel: 'Energy',
    headline: 'Source renewable energy components',
    subheadline:
      'Solar, storage, and clean-energy inputs from vetted suppliers — accelerate your transition on tese.io.',
    explorerIntro:
      'Renewables buyers compare modules, inverters, storage, and balance-of-system components — with efficiency, warranty, and supplier credentials in one place.',
    topicTags: [
      'Solar & storage',
      'Grid components',
      'Energy transition',
      'Efficiency data',
      'Clean deployment',
    ],
    categoryHandles: ['renewable-energy'],
  },
  {
    id: 'textiles',
    label: 'Textiles & fibres',
    shortLabel: 'Textiles',
    headline: 'Source responsible yarns, fibres & textiles',
    subheadline:
      'Recycled and certified textile inputs with full chain-of-custody traceability — sourced through tese.io.',
    explorerIntro:
      'Apparel and technical textile programmes source recycled yarns and certified fibres here — with GRS and chain-of-custody documentation on request.',
    topicTags: [
      'Recycled fibres',
      'GRS certified',
      'Chain of custody',
      'Technical textiles',
      'Responsible sourcing',
    ],
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
