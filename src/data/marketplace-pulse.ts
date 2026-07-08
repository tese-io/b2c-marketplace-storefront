export type MarketplacePulseItem = {
  id: string
  headline: string
  detail?: string
  href?: string
}

export const MARKETPLACE_PULSE: MarketplacePulseItem[] = [
  {
    id: 'suppliers',
    headline: '142+ verified suppliers',
    detail: 'Vetted sellers across recycled materials, renewables, and services',
    href: '/categories',
  },
  {
    id: 'rpet',
    headline: 'New listings: GRS-certified rPET flakes',
    detail: 'Compare MOQ, origin, and quote-ready specs',
    href: '/categories?sector=industrial-materials&industry=recycled-materials',
  },
  {
    id: 'ai-sourcing',
    headline: 'AI Sourcing',
    detail: 'Describe your need — match certified suppliers in seconds',
    href: '/sourcing',
  },
  {
    id: 'trust',
    headline: 'Trust signals on every listing',
    detail: 'ASI · GRS · ISO 14001 · chain-of-custody verification',
    href: '/categories?listing=service',
  },
  {
    id: 'carbon',
    headline: 'Embodied carbon & EPD data',
    detail: 'Filter listings by sector and sustainability metadata',
    href: '/categories',
  },
]
