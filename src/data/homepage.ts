export type HomeService = {
  id: string
  title: string
  description: string
  href: string
  icon: 'marketplace' | 'sourcing' | 'verification' | 'logistics' | 'finance'
}

export type HomePartnerStat = {
  value: string
  label: string
}

export type HomeTestimonial = {
  id: string
  quote: string
  name: string
  role: string
  company: string
  rating: number
}

export type HomeInsight = {
  id: string
  title: string
  excerpt: string
  category: string
  href: string
  accent: string
}

export type HomePartner = {
  id: string
  label: string
}

export type HomeSecondaryCta = {
  eyebrow: string
  heading: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

export const HOME_SERVICES: HomeService[] = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    description:
      'Browse vetted sustainable listings with MOQ, origin, certifications, and embodied carbon data — compare suppliers side by side.',
    href: '/categories',
    icon: 'marketplace',
  },
  {
    id: 'sourcing',
    title: 'AI Sourcing',
    description:
      'Describe what you need in plain language. tese.io matches certified suppliers, checks credentials, and scans the web for alternatives.',
    href: '/sourcing',
    icon: 'sourcing',
  },
  {
    id: 'verification',
    title: 'Verification & chain of custody',
    description:
      'Mill certificates, GRS/ASI traceability, and chain-of-custody verification services to de-risk procurement decisions.',
    href: '/categories?listing=service',
    icon: 'verification',
  },
  {
    id: 'logistics',
    title: 'Logistics & fulfilment',
    description:
      'Worldwide seller fulfilment zones, shipping quotes, and consolidated delivery options for multi-supplier orders.',
    href: '/categories?listing=service',
    icon: 'logistics',
  },
  {
    id: 'finance',
    title: 'Finance matchmaking',
    description:
      'tese.io connects your procurement to the right impact and sustainable finance — green loans, transition credit, and ESG-linked funding matched to your products and services.',
    href: '/sourcing?intent=finance',
    icon: 'finance',
  },
]

export const HOME_PARTNER_STATS: HomePartnerStat[] = [
  { value: '50+', label: 'Verified suppliers' },
  { value: '8', label: 'Sustainable categories' },
  { value: 'Worldwide', label: 'Fulfilment coverage' },
]

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    id: '1',
    quote:
      'tese.io cut our supplier discovery time from weeks to days. Certification data on every listing means our procurement team can sign off faster.',
    name: 'Elena Müller',
    role: 'Head of Sustainable Procurement',
    company: 'NordBuild GmbH',
    rating: 5,
  },
  {
    id: '2',
    quote:
      'The AI sourcing workspace found three lower-carbon aluminium alternatives we had never seen on traditional marketplaces. Game changer for our ESG targets.',
    name: 'James Okonkwo',
    role: 'Materials Engineer',
    company: 'GreenRail Infrastructure',
    rating: 5,
  },
  {
    id: '3',
    quote:
      'Multi-vendor comparison on a single product page is exactly what B2B buyers need. We consolidated four solar suppliers into one RFQ workflow.',
    name: 'Sofia Andersson',
    role: 'Renewables Buyer',
    company: 'Helios Energy AB',
    rating: 5,
  },
]

export const HOME_INSIGHTS: HomeInsight[] = [
  {
    id: '1',
    title: 'How to verify recycled content claims on industrial metals',
    excerpt:
      'A practical guide to mill certificates, ASI chain-of-custody, and what to ask suppliers before signing.',
    category: 'Procurement guide',
    href: '#',
    accent: '#475569',
  },
  {
    id: '2',
    title: 'Embodied carbon benchmarks for construction materials',
    excerpt:
      'Compare EPD-backed data across cement alternatives, recycled steel, and low-carbon aggregates.',
    category: 'Sustainability',
    href: '#',
    accent: '#059669',
  },
  {
    id: '3',
    title: 'Solar procurement: multi-vendor RFQ best practices',
    excerpt:
      'How to evaluate inverters, panels, and storage from multiple certified sellers on one platform.',
    category: 'Energy',
    href: '#',
    accent: '#0891B2',
  },
  {
    id: '4',
    title: 'GRS and responsible sourcing for textile inputs',
    excerpt:
      'What certification evidence to expect when sourcing recycled yarns and fibres for apparel supply chains.',
    category: 'Textiles',
    href: '#',
    accent: '#E11D48',
  },
]

export const HOME_PARTNERS: HomePartner[] = [
  { id: 'grs', label: 'GRS' },
  { id: 'asi', label: 'ASI' },
  { id: 'iso', label: 'ISO 14001' },
  { id: 'eu-ecolabel', label: 'EU Ecolabel' },
  { id: 'fsc', label: 'FSC' },
  { id: 'epd', label: 'EPD Verified' },
  { id: 'reach', label: 'REACH Compliant' },
  { id: 'coc', label: 'Chain of Custody' },
]

export const HOME_SECONDARY_CTA: HomeSecondaryCta = {
  eyebrow: 'For suppliers',
  heading: 'List your sustainable products on tese.io',
  description:
    'Reach procurement teams actively searching for certified, low-carbon materials. Onboard in minutes and start receiving qualified RFQs.',
  primaryLabel: 'Sell on tese.io',
  primaryHref: '/register',
  secondaryLabel: 'Talk to an expert',
  secondaryHref: '/sourcing',
}
