/**
 * Ticker items. `key` indexes `pulse.<key>` in the message catalogs rather than
 * carrying copy, so the ticker reads in the visitor's language.
 */
export type MarketplacePulseItem = {
  id: string
  key: string
  href?: string
}

export const MARKETPLACE_PULSE: MarketplacePulseItem[] = [
  { id: 'suppliers', key: 'suppliers', href: '/categories' },
  {
    id: 'rpet',
    key: 'rpet',
    href: '/categories?sector=industrial-materials&industry=recycled-materials'
  },
  { id: 'ai-sourcing', key: 'aiSourcing', href: '/sourcing' },
  { id: 'trust', key: 'trust', href: '/categories?listing=service' },
  { id: 'carbon', key: 'carbon', href: '/categories' }
]
