export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'tese.io'
export const SITE_TAGLINE = 'Sustainability-focused marketplace'
export const SITE_DESCRIPTION =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  'tese.io — source certified, low-carbon materials from vetted suppliers with ESG traceability and AI-powered discovery.'

export const SITE_HERO_EYEBROW =
  'Procurement aligned with your ESG goals'

export const SITE_HERO_DEFAULT = {
  lead: 'The sustainability-focused marketplace for',
  accent: 'responsible procurement',
  tail: '',
} as const
