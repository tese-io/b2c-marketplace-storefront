export const QUICK_PROMPTS = [
  {
    label: 'Global material search',
    query: 'Recycled aluminium ingots, 99.7% purity, low-carbon, EU suppliers, ~10 t/month',
  },
  {
    label: 'Sustainable finance',
    query: 'I need impact or sustainable finance matched to my procurement — green loans or ESG-linked funding for recycled metals',
  },
  {
    label: 'Multi-supplier RFQ',
    query: 'Hot-rolled steel coil S355JR with EN 10204 3.1 certificates, 25 MT — send RFQ to certified EU mills',
  },
  {
    label: 'Certified rPET flakes',
    query: 'Food-grade rPET flakes, GRS certified, hot-washed, European mills, 50 tonnes quarterly',
  },
  {
    label: 'Post-consumer HDPE',
    query: 'HDPE resin with 30% post-consumer content for blow moulding, food-contact grade',
  },
  {
    label: 'Carbon footprint compare',
    query: 'Compare low-carbon aluminium vs primary ingot suppliers with published Scope 3 data',
  },
]

export const STAGES = [
  'Reading your requirement…',
  'Matching the tese.io catalogue…',
  'Scanning the web for suppliers…',
  'Checking certifications & regions…',
  'Ranking and writing your brief…',
]

export type AiModelId = 'tesera'

export type AiModel = {
  id: AiModelId
  label: string
  description: string
  available: boolean
}

/** Extend this list when additional models are supported. */
export const AI_MODELS: AiModel[] = [
  {
    id: 'tesera',
    label: 'Tesera AI',
    description: 'Catalogue match + live web sourcing',
    available: true,
  },
]

export const DEFAULT_AI_MODEL: AiModelId = 'tesera'

export const SOURCING_LEGAL_LINKS = [
  { id: 'terms', label: 'Terms & Conditions', href: '/terms' },
  { id: 'privacy', label: 'Privacy Policy', href: '/privacy' },
  { id: 'resources', label: 'Resources', href: '/resources' },
] as const
