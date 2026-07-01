import { HttpTypes } from '@medusajs/types'

export type ProcurementSpec = {
  label: string
  value: string
}

export type ProductAdvantage = {
  title: string
  body: string
}

const CATEGORY_APPLICATIONS: Record<string, string[]> = {
  'metals-&-alloys': [
    'Structural fabrication & framing',
    'Automotive & machinery components',
    'Construction & infrastructure',
  ],
  'recycled-materials': [
    'Circular manufacturing programmes',
    'Low-carbon product lines',
    'Packaging & remanufacturing',
  ],
  'polymers-&-plastics': [
    'Injection moulding & extrusion',
    'Packaging & consumer goods',
    'Industrial components',
  ],
  'industrial-chemicals': [
    'Process manufacturing',
    'Water treatment & utilities',
    'Specialty formulations',
  ],
  'construction-materials': [
    'Civil & commercial builds',
    'Infrastructure projects',
    'Renovation & retrofit',
  ],
  packaging: [
    'Corrugated & flexible packaging',
    'E-commerce fulfilment',
    'Food-grade applications',
  ],
  'renewable-energy': [
    'Solar & wind projects',
    'Energy storage systems',
    'Grid & microgrid deployment',
  ],
  'textiles-&-fibres': [
    'Apparel & technical textiles',
    'Automotive interiors',
    'Recycled fibre programmes',
  ],
}

export function getProductMetadata(product: HttpTypes.StoreProduct) {
  return (product.metadata || {}) as Record<string, unknown>
}

export { parseSectorTags, SECTOR_TAGS_KEY } from '@/lib/helpers/sector-preferences'

export function getProcurementSpecs(product: HttpTypes.StoreProduct): ProcurementSpec[] {
  const meta = getProductMetadata(product)
  const specs: ProcurementSpec[] = []

  if (product.subtitle) {
    specs.push({ label: 'Specification', value: String(product.subtitle) })
  }

  if (meta.moq) specs.push({ label: 'MOQ', value: String(meta.moq) })
  if (meta.origin) specs.push({ label: 'Origin', value: String(meta.origin) })
  if (meta.lead_time_days) {
    specs.push({ label: 'Lead time', value: `${meta.lead_time_days} days` })
  }
  if (meta.certifications) {
    specs.push({ label: 'Certifications', value: String(meta.certifications) })
  }
  if (meta.co2_kg_per_unit) {
    const unit = meta.unit ? String(meta.unit) : 'unit'
    specs.push({
      label: 'Embodied CO₂',
      value: `${meta.co2_kg_per_unit} kg / ${unit}`,
    })
  }
  if (meta.hs_code) specs.push({ label: 'HS code', value: String(meta.hs_code) })
  if (meta.inverter_efficiency) {
    specs.push({
      label: 'Inverter efficiency',
      value: `~${meta.inverter_efficiency}%`,
    })
  }
  if (meta.module_efficiency) {
    specs.push({
      label: 'Module efficiency',
      value: `~${meta.module_efficiency}%`,
    })
  }
  if (meta.panel_wattage) {
    specs.push({ label: 'Panel wattage', value: String(meta.panel_wattage) })
  }
  if (meta.warranty_years) {
    specs.push({ label: 'Warranty', value: `${meta.warranty_years} years` })
  }
  if (meta.unit && !meta.co2_kg_per_unit) {
    specs.push({ label: 'Unit', value: String(meta.unit) })
  }

  return specs
}

export function getProductAdvantages(product: HttpTypes.StoreProduct): ProductAdvantage[] {
  const meta = getProductMetadata(product)
  const desc = (product.description || '').toLowerCase()
  const title = (product.title || '').toLowerCase()
  const items: ProductAdvantage[] = []

  if (meta.certifications) {
    items.push({
      title: 'Certified supply',
      body: String(meta.certifications),
    })
  }

  if (meta.co2_kg_per_unit) {
    items.push({
      title: 'Carbon transparency',
      body: 'Embodied carbon disclosed to support Scope 3 reporting and supplier comparison.',
    })
  }

  if (title.includes('recycled') || desc.includes('recycled') || desc.includes('circular')) {
    items.push({
      title: 'Circular & lower-carbon',
      body: 'Supports circular procurement and reduced upstream emissions versus virgin alternatives.',
    })
  }

  if (meta.origin) {
    items.push({
      title: 'Traceable origin',
      body: `Sourced from ${meta.origin} with documentation available on request.`,
    })
  }

  if (items.length === 0) {
    items.push({
      title: 'Vetted on tese.io',
      body: 'Supplier-verified listing with quote-ready specs and sustainability metadata.',
    })
  }

  return items.slice(0, 4)
}

export function getProductApplications(product: HttpTypes.StoreProduct): string[] {
  const handle = product.categories?.[0]?.handle
  if (handle && CATEGORY_APPLICATIONS[handle]) {
    return CATEGORY_APPLICATIONS[handle]
  }

  const desc = product.description || ''
  const sentences = desc
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 120)

  if (sentences.length >= 2) {
    return sentences.slice(0, 4)
  }

  return [
    'Industrial procurement programmes',
    'Sustainability-led sourcing',
    'B2B supply contracts',
  ]
}
