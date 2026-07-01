import type { ReactNode } from 'react'
import type { SectorId } from '@/data/sectors'

export type SectorVisual = {
  accent: string
  accentSoft: string
  iconBg: string
  icon: ReactNode
}

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const SECTOR_VISUALS: Record<Exclude<SectorId, 'all'>, SectorVisual> = {
  'industrial-materials': {
    accent: '#475569',
    accentSoft: 'rgba(71, 85, 105, 0.14)',
    iconBg: 'rgba(71, 85, 105, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path {...stroke} d="M4 18h16M6 14l3-8h6l3 8M9 6V4m6 2V4" />
      </svg>
    ),
  },
  construction: {
    accent: '#57534E',
    accentSoft: 'rgba(87, 83, 78, 0.14)',
    iconBg: 'rgba(87, 83, 78, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path {...stroke} d="M4 20h16M6 20V10l6-6 6 6v10M10 20v-6h4v6" />
      </svg>
    ),
  },
  energy: {
    accent: '#0891B2',
    accentSoft: 'rgba(8, 145, 178, 0.14)',
    iconBg: 'rgba(8, 145, 178, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path {...stroke} d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle {...stroke} cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  textiles: {
    accent: '#E11D48',
    accentSoft: 'rgba(225, 29, 72, 0.14)',
    iconBg: 'rgba(225, 29, 72, 0.12)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path {...stroke} d="M4 6c4 0 4 12 8 12s4-12 8-12M4 18c4 0 4-12 8-12s4 12 8 12" />
      </svg>
    ),
  },
}

export function getSectorVisual(sectorId: Exclude<SectorId, 'all'>): SectorVisual {
  return SECTOR_VISUALS[sectorId]
}
