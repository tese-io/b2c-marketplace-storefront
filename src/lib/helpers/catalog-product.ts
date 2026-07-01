import { HttpTypes } from '@medusajs/types'

import type { SectorId } from '@/data/sectors'
import { parseSectorTags } from '@/lib/helpers/sector-preferences'
import type { ProcurementSpec } from '@/lib/helpers/product-procurement'
import { getProcurementSpecs, getProductMetadata } from '@/lib/helpers/product-procurement'
import { SellerProps } from '@/types/seller'

export const CATALOG_HANDLE_KEY = 'catalog_handle'
export const BRAND_NAME_KEY = 'brand_name'
export const BRAND_SLUG_KEY = 'brand_slug'
export const BRAND_LOGO_KEY = 'brand_logo'
export const IS_CATALOG_PRIMARY_KEY = 'is_catalog_primary'

export type CatalogListing = HttpTypes.StoreProduct & { seller?: SellerProps }

export type CatalogBrand = {
  slug: string
  name: string
  logo?: string
  listing: CatalogListing
}

export function getCatalogHandle(
  product: HttpTypes.StoreProduct
): string | null {
  const meta = getProductMetadata(product)
  const fromMeta = meta[CATALOG_HANDLE_KEY]
  if (fromMeta) return String(fromMeta)
  return null
}

export function isCatalogPrimary(product: HttpTypes.StoreProduct): boolean {
  const meta = getProductMetadata(product)
  return meta[IS_CATALOG_PRIMARY_KEY] === true || meta[IS_CATALOG_PRIMARY_KEY] === 'true'
}

export function getBrandSlug(product: HttpTypes.StoreProduct): string {
  const meta = getProductMetadata(product)
  if (meta[BRAND_SLUG_KEY]) return String(meta[BRAND_SLUG_KEY])
  if (meta[BRAND_NAME_KEY]) {
    return String(meta[BRAND_NAME_KEY])
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
  return product.handle || product.id
}

export function getBrandName(product: HttpTypes.StoreProduct): string {
  const meta = getProductMetadata(product)
  if (meta[BRAND_NAME_KEY]) return String(meta[BRAND_NAME_KEY])
  return product.seller?.name || 'Supplier'
}

export function getBrandLogo(product: HttpTypes.StoreProduct): string | undefined {
  const meta = getProductMetadata(product)
  const logo = meta[BRAND_LOGO_KEY]
  return logo ? String(logo) : undefined
}

export function toCatalogBrands(listings: CatalogListing[]): CatalogBrand[] {
  return listings.map((listing) => ({
    slug: getBrandSlug(listing),
    name: getBrandName(listing),
    logo: getBrandLogo(listing),
    listing,
  }))
}

export function filterCatalogListings(
  products: CatalogListing[],
  catalogHandle: string
): CatalogListing[] {
  return products.filter((p) => {
    const handle = getCatalogHandle(p)
    return handle === catalogHandle || p.handle === catalogHandle
  })
}

export function getCatalogPrimary(listings: CatalogListing[]): CatalogListing {
  return (
    listings.find(isCatalogPrimary) ||
    listings.find((p) => p.handle === getCatalogHandle(p)) ||
    listings[0]
  )
}

export function resolveCatalogHandleFromRoute(
  handle: string,
  product?: HttpTypes.StoreProduct | null
): string | null {
  if (!product) return null
  const catalogHandle = getCatalogHandle(product)
  if (catalogHandle) return catalogHandle
  return null
}

export function isCatalogGroup(listings: CatalogListing[]): boolean {
  return listings.length > 1
}

export function getCatalogDisplayTitle(listings: CatalogListing[]): string {
  const primary = getCatalogPrimary(listings)
  const meta = getProductMetadata(primary)
  if (meta.catalog_title) return String(meta.catalog_title)
  const baseTitle = primary.title || 'Product'
  return baseTitle.replace(/\s*—\s*.+$/, '').trim()
}

export function getAggregatedCatalogSpecs(
  listings: CatalogListing[]
): ProcurementSpec[] {
  const labelValues = new Map<string, Set<string>>()

  listings.forEach((listing) => {
    getProcurementSpecs(listing).forEach(({ label, value }) => {
      if (!labelValues.has(label)) labelValues.set(label, new Set())
      labelValues.get(label)!.add(value)
    })
  })

  return Array.from(labelValues.entries()).map(([label, values]) => ({
    label,
    value: Array.from(values).join(', '),
  }))
}

export function findListingByBrandSlug(
  listings: CatalogListing[],
  brandSlug?: string | null
): CatalogListing {
  if (!brandSlug) return getCatalogPrimary(listings)
  const brands = toCatalogBrands(listings)
  return (
    brands.find((b) => b.slug === brandSlug)?.listing ||
    getCatalogPrimary(listings)
  )
}

export type CatalogGridItem = {
  product: CatalogListing
  vendorCount?: number
  displayTitle?: string
}

/** One card per catalog_handle; standalone listings pass through unchanged. */
export function dedupeCatalogGridProducts(
  products: CatalogListing[]
): CatalogGridItem[] {
  const catalogGroups = new Map<string, CatalogListing[]>()
  const standalone: CatalogListing[] = []

  for (const product of products) {
    const handle = getCatalogHandle(product)
    if (!handle) {
      standalone.push(product)
      continue
    }
    const group = catalogGroups.get(handle) || []
    group.push(product)
    catalogGroups.set(handle, group)
  }

  const catalogItems: CatalogGridItem[] = Array.from(
    catalogGroups.entries()
  ).map(([handle, group]) => {
    const primary = getCatalogPrimary(group)
    return {
      product: primary,
      vendorCount: group.length,
      displayTitle: getCatalogDisplayTitle(group),
    }
  })

  return [
    ...standalone.map((product) => ({ product })),
    ...catalogItems,
  ]
}

export function countCatalogListings(
  products: CatalogListing[],
  catalogHandle: string
): number {
  return filterCatalogListings(products, catalogHandle).length
}

function listingSectorScore(
  listing: CatalogListing,
  sectorId?: SectorId
): number {
  if (!sectorId || sectorId === 'all') return 0
  const tags = parseSectorTags(getProductMetadata(listing))
  return tags.includes(sectorId) ? 10 : 0
}

function listingPriceScore(listing: CatalogListing): number {
  const variant = listing.variants?.[0]
  const amount = variant?.calculated_price?.calculated_amount
  if (typeof amount !== 'number') return 0
  return Math.max(0, 20 - Math.floor(amount / 500))
}

function listingLeadTimeScore(listing: CatalogListing): number {
  const meta = getProductMetadata(listing)
  const days = Number(meta.lead_time_days)
  if (!days || Number.isNaN(days)) return 0
  return Math.max(0, 15 - Math.floor(days / 3))
}

/** Rank catalog brand listings for sector relevance, price, and lead time. */
export function sortCatalogListingsForPersonalization(
  listings: CatalogListing[],
  options?: {
    sectorId?: SectorId
    preferredBrandSlugs?: string[]
  }
): CatalogListing[] {
  const preferred = new Set(options?.preferredBrandSlugs || [])

  return [...listings].sort((a, b) => {
    const scoreA =
      listingSectorScore(a, options?.sectorId) +
      listingPriceScore(a) +
      listingLeadTimeScore(a) +
      (preferred.has(getBrandSlug(a)) ? 25 : 0)
    const scoreB =
      listingSectorScore(b, options?.sectorId) +
      listingPriceScore(b) +
      listingLeadTimeScore(b) +
      (preferred.has(getBrandSlug(b)) ? 25 : 0)
    return scoreB - scoreA
  })
}

export function sortCatalogBrands(
  listings: CatalogListing[],
  options?: {
    sectorId?: SectorId
    preferredBrandSlugs?: string[]
  }
): CatalogBrand[] {
  const sorted = sortCatalogListingsForPersonalization(listings, options)
  return toCatalogBrands(sorted)
}

export function parsePreferredBrandSlugs(
  metadata?: Record<string, unknown> | null
): string[] {
  if (!metadata?.preferred_brands) return []
  const raw = metadata.preferred_brands
  const arr = Array.isArray(raw)
    ? raw
    : typeof raw === 'string'
      ? (() => {
          try {
            return JSON.parse(raw) as unknown[]
          } catch {
            return []
          }
        })()
      : []
  return arr.map((s) => String(s).toLowerCase())
}
