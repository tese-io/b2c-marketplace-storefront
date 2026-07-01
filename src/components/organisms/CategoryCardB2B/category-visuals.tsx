import type { ReactNode } from 'react'

export type CategoryVisual = {
  accent: string
  accentSoft: string
  iconBg: string
  icon: ReactNode
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  'metals-&-alloys': {
    accent: '#475569',
    accentSoft: 'rgba(71, 85, 105, 0.12)',
    iconBg: 'rgba(71, 85, 105, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M4 18h16M6 14l3-8h6l3 8M9 6V4m6 2V4" />
      </svg>
    ),
  },
  'recycled-materials': {
    accent: '#059669',
    accentSoft: 'rgba(5, 150, 105, 0.12)',
    iconBg: 'rgba(5, 150, 105, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M7 7l3-3 4 4-3 3M17 17l-3 3-4-4 3-3M7 17l-4-1 1-4 4 1M17 7l4 1-1 4-4-1" />
      </svg>
    ),
  },
  'polymers-&-plastics': {
    accent: '#4338CA',
    accentSoft: 'rgba(67, 56, 202, 0.12)',
    iconBg: 'rgba(67, 56, 202, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M12 3l7 4v10l-7 4-7-4V7l7-4zM12 3v18M5 7l7 4 7-4" />
      </svg>
    ),
  },
  'industrial-chemicals': {
    accent: '#C2410C',
    accentSoft: 'rgba(194, 65, 12, 0.12)',
    iconBg: 'rgba(194, 65, 12, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M9 3h6l1 7-4 11-4-11 1-7zM8 10h8" />
      </svg>
    ),
  },
  'construction-materials': {
    accent: '#57534E',
    accentSoft: 'rgba(87, 83, 78, 0.12)',
    iconBg: 'rgba(87, 83, 78, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M4 20h16M6 20V10l6-6 6 6v10M10 20v-6h4v6" />
      </svg>
    ),
  },
  packaging: {
    accent: '#7C3AED',
    accentSoft: 'rgba(124, 58, 237, 0.12)',
    iconBg: 'rgba(124, 58, 237, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M12 3l8 4.5V17l-8 4.5-8-4.5V7.5L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
  'renewable-energy': {
    accent: '#0891B2',
    accentSoft: 'rgba(8, 145, 178, 0.12)',
    iconBg: 'rgba(8, 145, 178, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        <circle {...stroke} cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  'textiles-&-fibres': {
    accent: '#E11D48',
    accentSoft: 'rgba(225, 29, 72, 0.12)',
    iconBg: 'rgba(225, 29, 72, 0.1)',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
        <path {...stroke} d="M4 6c4 0 4 12 8 12s4-12 8-12M4 18c4 0 4-12 8-12s4 12 8 12" />
      </svg>
    ),
  },
}

export function getCategoryVisual(handle: string): CategoryVisual {
  return (
    CATEGORY_VISUALS[handle] || {
      accent: 'rgb(var(--tese-ink))',
      accentSoft: 'rgba(var(--tese-lime), 0.12)',
      iconBg: 'rgba(var(--tese-lime), 0.15)',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...stroke} d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      ),
    }
  )
}
