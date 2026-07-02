import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { formatListingTabLabel } from '@/data/explorer-copy'
import type { SectorId } from '@/data/sectors'
import { buildCatalogQuery, type ListingType } from '@/lib/helpers/sector-preferences'

export function CatalogListingTypeTabs ({
  activeListingType,
  sectorId,
  industryHandle,
  productCount,
  serviceCount,
}: {
  activeListingType?: ListingType
  sectorId: SectorId
  industryHandle?: string
  productCount?: number
  serviceCount?: number
}) {
  const basePath = '/categories'
  const productsHref = `${basePath}${buildCatalogQuery(sectorId, industryHandle)}`
  const servicesHref = `${basePath}${buildCatalogQuery(sectorId, industryHandle, 'service')}`
  const isServices = activeListingType === 'service'

  return (
    <div
      className="tese-catalog-listing-tabs"
      role="tablist"
      aria-label="Listing types"
    >
      <LocalizedClientLink
        href={productsHref}
        className={`tese-catalog-listing-tab${!isServices ? ' tese-catalog-listing-tab-active' : ''}`}
        aria-current={!isServices ? 'page' : undefined}
      >
        {formatListingTabLabel('products', productCount)}
      </LocalizedClientLink>
      <LocalizedClientLink
        href={servicesHref}
        className={`tese-catalog-listing-tab${isServices ? ' tese-catalog-listing-tab-active' : ''}`}
        aria-current={isServices ? 'page' : undefined}
      >
        {formatListingTabLabel('services', serviceCount)}
      </LocalizedClientLink>
    </div>
  )
}
