import { SECTORS, type SectorDefinition, type SectorId } from '@/data/sectors'
import { buildCatalogQuery, type ListingType } from '@/lib/helpers/sector-preferences'

import { CatalogSectorLink } from './CatalogActiveSectorChip'

export function CatalogSectorTabs({
  activeSectorId,
  basePath,
  industryHandle,
  listingType,
}: {
  activeSectorId: SectorId
  basePath: string
  industryHandle?: string
  listingType?: ListingType
}) {
  return (
    <div className="tese-catalog-tabs" role="tablist" aria-label="Industry sectors">
      {SECTORS.map((sector) => {
        const isActive = sector.id === activeSectorId
        const href = `${basePath}${buildCatalogQuery(
          sector.id,
          sector.id === activeSectorId ? industryHandle : undefined,
          listingType
        )}`

        return (
          <CatalogSectorLink
            key={sector.id}
            href={href}
            className={`tese-catalog-tab${isActive ? ' tese-catalog-tab-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {sector.id === 'all' ? 'All' : sector.shortLabel}
          </CatalogSectorLink>
        )
      })}
    </div>
  )
}

export function getCatalogHeadline(
  sector: SectorDefinition,
  categoryName?: string
): string {
  if (categoryName) return categoryName
  if (sector.id === 'all') return 'All products & services'
  return sector.headline
}
