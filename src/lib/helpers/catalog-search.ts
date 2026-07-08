import type { SectorDefinition } from '@/data/sectors'
import type { ListingType } from '@/lib/helpers/sector-preferences'

const quoteValue = (value: string) => `"${value.replace(/"/g, '\\"')}"`

/** "metals-&-alloys" → "Metals & Alloys" (fallback when no label map given) */
export function humanizeCategoryHandle(handle: string): string {
  return handle
    .split('-')
    .filter(Boolean)
    .map((part) =>
      part === '&' ? '&' : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(' ')
}

/**
 * Builds the Algolia filter string for the main catalog. Sector matching
 * mirrors productMatchesSector: a product matches via its indexed `sectors`
 * facet (from product/category sector_tags) or via the sector's fallback
 * category handles.
 */
export function buildCatalogFilters({
  sector,
  industryHandle,
  categoryId,
  listingType,
}: {
  sector?: SectorDefinition
  industryHandle?: string
  categoryId?: string
  listingType?: ListingType
}): string {
  const clauses = ['NOT seller.store_status:SUSPENDED']

  if (sector && sector.id !== 'all') {
    const sectorClauses = [
      `sectors:${quoteValue(sector.id)}`,
      ...sector.categoryHandles.map(
        (handle) => `categories.handle:${quoteValue(handle)}`
      ),
    ]
    clauses.push(`(${sectorClauses.join(' OR ')})`)
  }

  if (industryHandle) {
    clauses.push(`categories.handle:${quoteValue(industryHandle)}`)
  }

  if (categoryId) {
    clauses.push(`categories.id:${quoteValue(categoryId)}`)
  }

  if (listingType === 'service') {
    clauses.push('listing_type:service')
  }

  return clauses.join(' AND ')
}

/** Facets requested for catalog/listing pages (must be in attributesForFaceting). */
export const CATALOG_FACETS = [
  'certifications',
  'origin',
  'sectors',
  'is_circular',
  'co2_kg_per_unit',
  'seller.is_verified',
  'categories.handle',
]

export type FacetFilterParams = {
  certifications?: string
  origin?: string
  sectors?: string
  categories?: string
  circular?: string
  verified?: string
  co2_min?: string
  co2_max?: string
  min_price?: string
  max_price?: string
  rating?: string
} & Record<string, string | undefined>

const toNumber = (value?: string): number | null => {
  if (value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

/**
 * Translates facet-related URL params (comma-separated multi-select values)
 * into Algolia filter clauses. Shared by the server catalog page and the
 * client Algolia listing so both speak the same filter dialect.
 */
export function buildFacetFilterClauses(
  params: FacetFilterParams
): string[] {
  const clauses: string[] = []

  const addOrGroup = (attribute: string, raw?: string) => {
    const values = (raw || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    if (!values.length) return
    clauses.push(
      `(${values.map((v) => `${attribute}:${quoteValue(v)}`).join(' OR ')})`
    )
  }

  addOrGroup('certifications', params.certifications)
  addOrGroup('origin', params.origin)
  addOrGroup('sectors', params.sectors)
  addOrGroup('categories.handle', params.categories)

  if (params.circular === 'true') {
    clauses.push('is_circular:true')
  }

  if (params.verified === 'true') {
    clauses.push('seller.is_verified:true')
  }

  const co2Min = toNumber(params.co2_min)
  const co2Max = toNumber(params.co2_max)
  if (co2Min !== null && co2Max !== null) {
    clauses.push(`co2_kg_per_unit:${co2Min} TO ${co2Max}`)
  } else if (co2Min !== null) {
    clauses.push(`co2_kg_per_unit >= ${co2Min}`)
  } else if (co2Max !== null) {
    clauses.push(`co2_kg_per_unit <= ${co2Max}`)
  }

  const priceMin = toNumber(params.min_price)
  const priceMax = toNumber(params.max_price)
  if (priceMin !== null && priceMax !== null) {
    clauses.push(`variants.prices.amount:${priceMin} TO ${priceMax}`)
  } else if (priceMin !== null) {
    clauses.push(`variants.prices.amount >= ${priceMin}`)
  } else if (priceMax !== null) {
    clauses.push(`variants.prices.amount <= ${priceMax}`)
  }

  const ratings = (params.rating || '')
    .split(',')
    .map((v) => toNumber(v))
    .filter((v): v is number => v !== null)
  if (ratings.length) {
    clauses.push(`average_rating >= ${Math.min(...ratings)}`)
  }

  return clauses
}
