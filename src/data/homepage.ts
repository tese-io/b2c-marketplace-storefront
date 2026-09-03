/**
 * Homepage content.
 *
 * Copy lives in the message catalogs under `home.*`; these entries carry only
 * what is language-independent — routes, icons, accent colours, and proper
 * nouns such as people's names, company names and certification schemes, which
 * are never translated. `key` indexes the catalog.
 */

export type HomeService = {
  id: string
  key: string
  href: string
  icon: 'marketplace' | 'sourcing' | 'verification' | 'logistics' | 'finance'
}

export const HOME_SERVICES: HomeService[] = [
  { id: 'marketplace', key: 'marketplace', href: '/categories', icon: 'marketplace' },
  { id: 'sourcing', key: 'sourcing', href: '/sourcing', icon: 'sourcing' },
  {
    id: 'verification',
    key: 'verification',
    href: '/categories?listing=service',
    icon: 'verification'
  },
  {
    id: 'logistics',
    key: 'logistics',
    href: '/categories?listing=service',
    icon: 'logistics'
  },
  { id: 'finance', key: 'finance', href: '/sourcing?intent=finance', icon: 'finance' }
]

export type HomePartnerStat = {
  /** A translation key when the value is a word, or a literal when it is a figure. */
  value: string
  valueKey?: string
  labelKey: string
}

export const HOME_PARTNER_STATS: HomePartnerStat[] = [
  { value: '50+', labelKey: 'listedSuppliers' },
  { value: '8', labelKey: 'sustainableCategories' },
  { value: '', valueKey: 'worldwide', labelKey: 'fulfilmentCoverage' }
]

export type HomeTestimonial = {
  id: string
  name: string
  company: string
  rating: number
}

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  { id: '1', name: 'Elena Müller', company: 'NordBuild GmbH', rating: 5 },
  { id: '2', name: 'James Okonkwo', company: 'GreenRail Infrastructure', rating: 5 },
  { id: '3', name: 'Sofia Andersson', company: 'Helios Energy AB', rating: 5 }
]

export type HomeInsight = {
  id: string
  href: string
  accent: string
}

export const HOME_INSIGHTS: HomeInsight[] = [
  {
    id: '1',
    href: '/categories?sector=industrial-materials&industry=metals-%26-alloys',
    accent: '#475569'
  },
  {
    id: '2',
    href: '/categories?sector=construction&industry=construction-materials',
    accent: '#059669'
  },
  { id: '3', href: '/categories?sector=energy&industry=renewable-energy', accent: '#0891B2' },
  { id: '4', href: '/categories?sector=textiles&industry=textiles-%26-fibres', accent: '#E11D48' }
]

export type HomePartner = {
  id: string
  /** Certification scheme names are proper nouns and stay untranslated. */
  label: string
}

export const HOME_PARTNERS: HomePartner[] = [
  { id: 'grs', label: 'GRS' },
  { id: 'asi', label: 'ASI' },
  { id: 'iso', label: 'ISO 14001' },
  { id: 'eu-ecolabel', label: 'EU Ecolabel' },
  { id: 'fsc', label: 'FSC' },
  { id: 'epd', label: 'EPD Verified' },
  { id: 'reach', label: 'REACH Compliant' },
  { id: 'coc', label: 'Chain of Custody' }
]

export const HOME_SECONDARY_CTA = {
  primaryHref: '/register',
  secondaryHref: '/sourcing'
}
