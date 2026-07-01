import { HttpTypes } from '@medusajs/types'

import type { SectorDefinition, SectorId } from '@/data/sectors'
import { categoryHref } from '@/lib/data/categories'
import { buildCatalogQuery, type ListingType } from '@/lib/helpers/sector-preferences'

import { CatalogSectorLink } from './CatalogActiveSectorChip'

export function CatalogCategoryPills({
  categories,
  sector,
  sectorId,
  industryHandle,
  activeCategoryHandle,
  listingType,
}: {
  categories: HttpTypes.StoreProductCategory[]
  sector: SectorDefinition
  sectorId: SectorId
  industryHandle?: string
  activeCategoryHandle?: string
  listingType?: ListingType
}) {
  if (sector.id === 'all' && !categories.length) return null

  const allInSectorHref = `/categories${buildCatalogQuery(sectorId, undefined, listingType)}`
  const allActive = !industryHandle && !activeCategoryHandle

  return (
    <div className="tese-catalog-pills-row">
      <span className="tese-catalog-pills-label">Category</span>
      <div className="tese-catalog-pills">
        <CatalogSectorLink
          href={allInSectorHref}
          className={`tese-catalog-pill${allActive ? ' tese-catalog-pill-active' : ''}`}
        >
          {sector.id === 'all' ? 'All categories' : `All in ${sector.shortLabel}`}
        </CatalogSectorLink>
        {categories.map((cat) => {
          const isActive =
            industryHandle === cat.handle || activeCategoryHandle === cat.handle
          const href = categoryHref(cat.handle, buildCatalogQuery(sectorId, undefined, listingType))

          return (
            <CatalogSectorLink
              key={cat.id}
              href={href}
              className={`tese-catalog-pill${isActive ? ' tese-catalog-pill-active' : ''}`}
            >
              {cat.name}
            </CatalogSectorLink>
          )
        })}
      </div>
    </div>
  )
}
