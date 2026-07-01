import { HttpTypes } from '@medusajs/types'

import {
  DEFAULT_SECTOR_ID,
  getSectorById,
  SECTORS,
  sectorIncludesCategory,
  type SectorDefinition,
  type SectorId,
} from '@/data/sectors'

export const SECTOR_COOKIE = 'teseio_sector'
export const INDUSTRY_COOKIE = 'teseio_industry'
export const SECTOR_TAGS_KEY = 'sector_tags'

const VALID_SECTOR_IDS = new Set<SectorId>(
  SECTORS.map((s) => s.id).filter((id): id is SectorId => id !== 'all')
)

export function parseSectorTags(
  metadata?: Record<string, unknown> | null
): SectorId[] {
  if (!metadata) return []

  const raw = metadata[SECTOR_TAGS_KEY]
  if (!raw) return []

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

  return arr
    .map((id) => String(id))
    .filter((id): id is SectorId => VALID_SECTOR_IDS.has(id as SectorId))
}

export function inferSectorIdsFromCategoryHandle(
  categoryHandle: string
): SectorId[] {
  return SECTORS.filter(
    (s) => s.id !== 'all' && s.categoryHandles.includes(categoryHandle)
  ).map((s) => s.id)
}

export function getCategorySectorIds(
  category: HttpTypes.StoreProductCategory
): SectorId[] {
  const tagged = parseSectorTags(
    category.metadata as Record<string, unknown> | undefined
  )
  if (tagged.length) return tagged

  const handle = category.handle || ''
  return inferSectorIdsFromCategoryHandle(handle)
}

export function categoryMatchesSector(
  category: HttpTypes.StoreProductCategory,
  sector: SectorDefinition
): boolean {
  if (sector.id === 'all') return true

  const tags = getCategorySectorIds(category)
  if (tags.length) return tags.includes(sector.id)

  return sectorIncludesCategory(sector, category.handle || '')
}

export function categoryHandleMatchesSector(
  handle: string,
  sector: SectorDefinition,
  category?: HttpTypes.StoreProductCategory
): boolean {
  if (sector.id === 'all') return true
  if (category) return categoryMatchesSector(category, sector)
  return sectorIncludesCategory(sector, handle)
}

export function resolveSectorPreferences(
  searchParams?: { sector?: string; industry?: string },
  cookies?: { sector?: string; industry?: string },
  categories?: HttpTypes.StoreProductCategory[]
): { sectorId: SectorId; industryHandle?: string; sector: SectorDefinition } {
  const sectorId = (searchParams?.sector ||
    cookies?.sector ||
    DEFAULT_SECTOR_ID) as SectorId
  const sector = getSectorById(sectorId)
  const industryHandle = searchParams?.industry || cookies?.industry || undefined

  if (industryHandle) {
    const cat = categories?.find((c) => c.handle === industryHandle)
    if (!categoryHandleMatchesSector(industryHandle, sector, cat)) {
      return { sectorId: sector.id, industryHandle: undefined, sector }
    }
  }

  return { sectorId: sector.id, industryHandle, sector }
}

export function filterCategoriesBySectorTags(
  categories: HttpTypes.StoreProductCategory[],
  sector: SectorDefinition,
  industryHandle?: string
): HttpTypes.StoreProductCategory[] {
  let filtered = categories.filter((c) => categoryMatchesSector(c, sector))

  if (industryHandle) {
    filtered = filtered.filter((c) => c.handle === industryHandle)
  }

  return filtered
}

/** @deprecated Use filterCategoriesBySectorTags */
export function filterCategoriesBySector(
  categories: HttpTypes.StoreProductCategory[],
  sector: SectorDefinition,
  industryHandle?: string
): HttpTypes.StoreProductCategory[] {
  return filterCategoriesBySectorTags(categories, sector, industryHandle)
}

export function buildCategoriesById(
  categories: HttpTypes.StoreProductCategory[]
): Map<string, HttpTypes.StoreProductCategory> {
  return new Map(categories.map((c) => [c.id, c]))
}

export function resolveProductCategories(
  product: HttpTypes.StoreProduct,
  categoriesById: Map<string, HttpTypes.StoreProductCategory>
): HttpTypes.StoreProductCategory[] {
  return (product.categories || [])
    .map((c) => categoriesById.get(c.id) || c)
    .filter(Boolean) as HttpTypes.StoreProductCategory[]
}

export function getProductSectorIds(
  product: HttpTypes.StoreProduct,
  categoriesById: Map<string, HttpTypes.StoreProductCategory>
): SectorId[] {
  const ids = new Set<SectorId>()

  parseSectorTags(product.metadata as Record<string, unknown>).forEach((id) =>
    ids.add(id)
  )

  resolveProductCategories(product, categoriesById).forEach((cat) => {
    getCategorySectorIds(cat).forEach((id) => ids.add(id))
  })

  return Array.from(ids)
}

export function getProductSectorLabels(
  product: HttpTypes.StoreProduct,
  categoriesById: Map<string, HttpTypes.StoreProductCategory>
): string[] {
  return getProductSectorIds(product, categoriesById).map(
    (id) => getSectorById(id).shortLabel
  )
}

export function productMatchesSector(
  product: HttpTypes.StoreProduct,
  categoriesById: Map<string, HttpTypes.StoreProductCategory>,
  sector: SectorDefinition
): boolean {
  if (sector.id === 'all') return true

  const directTags = parseSectorTags(
    product.metadata as Record<string, unknown>
  )
  if (directTags.includes(sector.id)) return true

  return resolveProductCategories(product, categoriesById).some((cat) =>
    categoryMatchesSector(cat, sector)
  )
}

export function filterProductsBySector(
  products: HttpTypes.StoreProduct[],
  categories: HttpTypes.StoreProductCategory[],
  sector: SectorDefinition
): HttpTypes.StoreProduct[] {
  if (sector.id === 'all') return products

  const categoriesById = buildCategoriesById(categories)
  return products.filter((p) =>
    productMatchesSector(p, categoriesById, sector)
  )
}

export function filterProductsByCategoryHandle(
  products: HttpTypes.StoreProduct[],
  categoryHandle: string
): HttpTypes.StoreProduct[] {
  return products.filter((p) =>
    p.categories?.some((c) => c.handle === categoryHandle)
  )
}

export type ListingType = 'product' | 'service'

export function getProductListingType(
  product: HttpTypes.StoreProduct
): ListingType {
  return product.metadata?.listing_type === 'service' ? 'service' : 'product'
}

export function filterProductsByListingType(
  products: HttpTypes.StoreProduct[],
  listingType: ListingType
): HttpTypes.StoreProduct[] {
  return products.filter(
    (p) => getProductListingType(p) === listingType
  )
}

export function findCategoryIdByHandle(
  categories: HttpTypes.StoreProductCategory[],
  handle: string
): string | undefined {
  return categories.find((c) => c.handle === handle)?.id
}

export function buildCatalogQuery(
  sectorId: SectorId,
  industryHandle?: string,
  listing?: ListingType
): string {
  const params = new URLSearchParams()
  if (sectorId !== 'all') params.set('sector', sectorId)
  if (industryHandle) params.set('industry', industryHandle)
  if (listing === 'service') params.set('listing', 'service')
  const query = params.toString()
  return query ? `?${query}` : ''
}
