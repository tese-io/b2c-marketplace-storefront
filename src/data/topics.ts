export type TopicId =
  | 'circular-economy'
  | 'embodied-carbon'
  | 'traceability'
  | 'water-pollution'
  | 'renewable-transition'
  | 'responsible-textiles'

export type TopicDefinition = {
  id: TopicId
  label: string
  shortLabel: string
  description: string
  /** Metadata keys or tag strings used for future filter wiring */
  metadataKeys?: string[]
}

export const TOPIC_TAXONOMY: TopicDefinition[] = [
  {
    id: 'circular-economy',
    label: 'Circular economy & recycled content',
    shortLabel: 'Circular economy',
    description:
      'Recycled feedstocks, remanufacturing inputs, and closed-loop material programmes.',
    metadataKeys: ['useCases', 'sector_tags'],
  },
  {
    id: 'embodied-carbon',
    label: 'Embodied carbon & LCA',
    shortLabel: 'Embodied carbon',
    description:
      'Products with disclosed kg CO₂e per unit, EPDs, or comparative low-carbon claims.',
    metadataKeys: ['co2_kg_per_unit', 'environmentalImpactMetrics', 'esgMetrics'],
  },
  {
    id: 'traceability',
    label: 'Chain of custody & traceability',
    shortLabel: 'Traceability',
    description:
      'Mill certificates, chain-of-custody schemes, and origin documentation for audit-ready procurement.',
    metadataKeys: ['certifications', 'origin'],
  },
  {
    id: 'water-pollution',
    label: 'Water & pollution reduction',
    shortLabel: 'Water & pollution',
    description:
      'Inputs and processes that reduce water use, effluent, or upstream pollution intensity.',
    metadataKeys: ['useCases', 'environmentalImpactMetrics'],
  },
  {
    id: 'renewable-transition',
    label: 'Renewable energy transition',
    shortLabel: 'Energy transition',
    description:
      'Solar, storage, wind, and grid components that accelerate clean-energy deployment.',
    metadataKeys: ['sector_tags', 'useCases'],
  },
  {
    id: 'responsible-textiles',
    label: 'Responsible textiles',
    shortLabel: 'Textiles',
    description:
      'Recycled fibres, certified yarns, and technical textiles with full supply-chain evidence.',
    metadataKeys: ['certifications', 'useCases'],
  },
]

export const TOPIC_FILTER_SECTION_LABEL = 'Topics'

export function getTopicById (id: string): TopicDefinition | undefined {
  return TOPIC_TAXONOMY.find((t) => t.id === id)
}
