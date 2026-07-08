import type { SectorId } from './sectors'

export const EXPLORER_TAGLINE =
  'The search-engine for sustainable procurement'

export const EXPLORER_BLURB =
  'Discover vetted suppliers, compare certifications and embodied carbon, and source recycled and low-carbon materials across every industrial sector — on one B2B marketplace.'

export const CATALOG_EYEBROW = 'Sustainable catalogue'

export const CATALOG_DEFAULT_HEADLINE = 'All products & services'

export const CATALOG_DEFAULT_SUBTITLE = EXPLORER_BLURB

export const FEATURED_SECTION_EYEBROW = 'Latest listings'

export const FEATURED_SECTION_SUBTITLE =
  'Recently added and sector-relevant listings with MOQ, origin, certifications, and embodied carbon where disclosed.'

export const AI_SOURCING_TAGLINE = EXPLORER_TAGLINE

export const AI_SOURCING_HOOK =
  'Describe what you need in plain language. tese.io matches the catalogue, checks supplier credentials, and scans the web for alternatives — in one ask.'

export const AI_SOURCING_PROMO =
  'Send RFQs to multiple suppliers and track responses from this workspace.'

export const MEGA_MENU_PRODUCTS = {
  eyebrow: CATALOG_EYEBROW,
  title: EXPLORER_TAGLINE,
  subtitle:
    'Browse by material category — compare MOQ, origin, and certification evidence before you quote.',
  footerLabel: 'Explore full catalogue',
} as const

export const MEGA_MENU_INDUSTRIES = {
  eyebrow: 'Industry sectors',
  title: 'Industries we serve',
  subtitle:
    'Personalise discovery by sector. Each industry links to vetted suppliers and filterable sustainability data.',
  footerLabel: 'Browse all sectors',
} as const

export const MEGA_MENU_SERVICES = {
  eyebrow: 'Platform capabilities',
  title: 'Procurement services on tese.io',
  subtitle:
    'Enablers that de-risk sourcing — verification, logistics, finance, and AI discovery alongside the catalogue.',
  footerLabel: 'View all services',
} as const

export type TrustStageId = 'listed' | 'verified_supplier' | 'verified_product'

export type TrustStage = {
  id: TrustStageId
  label: string
  shortLabel: string
  description: string
}

export const TRUST_STAGES: TrustStage[] = [
  {
    id: 'listed',
    label: 'Listed on tese.io',
    shortLabel: 'Listed supplier',
    description:
      'This supplier has a marketplace profile and can receive enquiries and RFQs.',
  },
  {
    id: 'verified_supplier',
    label: 'Verified supplier',
    shortLabel: 'Verified supplier',
    description:
      'Identity and business credentials have been checked by tese.io.',
  },
  {
    id: 'verified_product',
    label: 'tese Verified product',
    shortLabel: 'tese Verified',
    description:
      'Certifications and sustainability claims on this listing have been validated against submitted evidence.',
  },
]

export const TRUST_PROGRAM_NAME = 'tese Verified'

export const TRUST_STATS_COPY = {
  eyebrow: 'Procurement-ready',
  heading: 'Evidence, traceability, and reach — built in',
  items: [
    {
      id: 'certifications',
      value: 'Certifications',
      label: 'Standards and documentation on products and services',
    },
    {
      id: 'circularity',
      value: 'Circularity',
      label: 'Recycled, reused, and low-carbon listings',
    },
    {
      id: 'fulfilment',
      value: 'Worldwide',
      label: 'Suppliers with declared shipping and fulfilment zones',
    },
    {
      id: 'discovery',
      value: 'AI + Web',
      label: 'Catalogue search plus AI-assisted supplier discovery',
    },
  ],
} as const

export const TRUST_FILTER_LABEL = 'tese Verified only'

export const CERTIFICATION_VOCABULARY = [
  'ISO 14001',
  'GRS',
  'FSC',
  'ASI',
  'Cradle to Cradle',
  'ISCC',
  'EPD',
  'REACH',
] as const

export const PDP_SECTIONS = {
  atAGlance: 'At a glance',
  overview: 'Overview',
  applications: 'Applications',
  benefits: 'Benefits',
  impact: 'Impact & use cases',
  certifications: 'Certifications',
  documents: 'Supporting documents',
  faqs: 'FAQs',
} as const

export const PDP_EMPTY = {
  leadTime: 'Contact supplier for lead time',
  applications: 'No applications listed for this product yet.',
  benefits: 'Supplier has not published key benefits yet.',
  impact:
    'Supplier has not published impact or deployment data yet. Request evidence at quote stage.',
  certifications: 'Request certificates and mill test reports at quote stage.',
  documents: 'No supporting documents published on this listing.',
  faqs: 'No FAQs published for this listing.',
} as const

export const CATALOG_FILTERS = {
  activeFilters: 'Active filters',
  clearAll: 'Clear all filters',
  removeFilters: 'Remove filters',
} as const

export function formatListingTabLabel (
  type: 'products' | 'services' | 'suppliers',
  count?: number
): string {
  const base =
    type === 'products'
      ? 'Products'
      : type === 'services'
        ? 'Services'
        : 'Suppliers'
  if (count === undefined) return base
  return `${base} (${count.toLocaleString()})`
}

export function catalogEmptyMessage ({
  query,
  sectorLabel,
  listingType,
}: {
  query?: string
  sectorLabel?: string
  listingType?: 'service'
}): string {
  if (query) {
    return `No results for “${query}”. Try different keywords, broaden your sector, or clear active filters.`
  }
  if (listingType === 'service') {
    return 'No services match your filters. Try another sector or browse all platform capabilities.'
  }
  if (sectorLabel) {
    return `No listings in ${sectorLabel.toLowerCase()} match your filters. Try a related category or clear filters to see more.`
  }
  return 'No listings match your filters. Adjust filters or browse all products and services.'
}

export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'metals-&-alloys':
    'Low-carbon and recycled metals for fabrication, automotive, and infrastructure — with mill certificates and ASI traceability where applicable.',
  'recycled-materials':
    'Circular inputs and post-consumer feedstocks for remanufacturing, packaging, and low-carbon product lines — often GRS or equivalent certified.',
  'polymers-&-plastics':
    'Recycled and bio-based polymers for extrusion, moulding, and packaging — compare recycled content and food-contact grades.',
  'industrial-chemicals':
    'Specialty and process chemicals for manufacturing and utilities — with REACH documentation and sustainability metadata on request.',
  'construction-materials':
    'Greener cement alternatives, aggregates, and structural inputs for civil, commercial, and retrofit projects — EPD-backed where available.',
  packaging:
    'Corrugated, flexible, and food-grade packaging from recycled fibre and polymers — for e-commerce, FMCG, and industrial fulfilment.',
  'renewable-energy':
    'Solar, storage, and wind components from vetted suppliers — modules, inverters, and balance-of-system with warranty and efficiency data.',
  'textiles-&-fibres':
    'Recycled yarns, responsible fibres, and technical textiles — chain-of-custody evidence for apparel and automotive supply chains.',
}

export function getCategoryDescription (handle: string, apiDescription?: string | null) {
  const trimmed = apiDescription?.trim()
  if (trimmed) return trimmed
  return CATEGORY_DESCRIPTIONS[handle] || null
}

export function getSectorExplorerIntro (sectorId: SectorId, fallback?: string) {
  if (fallback) return fallback
  return CATALOG_DEFAULT_SUBTITLE
}
