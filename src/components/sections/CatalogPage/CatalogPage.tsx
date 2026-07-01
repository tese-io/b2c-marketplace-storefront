import { HttpTypes } from '@medusajs/types'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import type { SectorDefinition, SectorId } from '@/data/sectors'
import { listCategories } from '@/lib/data/categories'
import { listProducts } from '@/lib/data/products'
import {
  buildCatalogQuery,
  categoryMatchesSector,
  filterCategoriesBySectorTags,
  filterProductsByCategoryHandle,
  filterProductsByListingType,
  filterProductsBySector,
  type ListingType,
} from '@/lib/helpers/sector-preferences'

import { CatalogActiveSectorChip } from './CatalogActiveSectorChip'
import { CatalogCategoryPills } from './CatalogCategoryPills'
import { CatalogProductGrid } from './CatalogProductGrid'
import { CatalogSectorTabs, getCatalogHeadline } from './CatalogSectorTabs'

export async function CatalogPage({
  locale,
  sector,
  sectorId,
  industryHandle,
  category,
  listingType,
}: {
  locale: string
  sector: SectorDefinition
  sectorId: SectorId
  industryHandle?: string
  category?: HttpTypes.StoreProductCategory
  listingType?: ListingType
}) {
  const { parentCategories } = await listCategories()
  const sectorCategories = filterCategoriesBySectorTags(parentCategories, sector)
  const basePath = '/categories'

  const { response } = await listProducts({
    countryCode: locale,
    category_id: category?.id,
    queryParams: { limit: 100, order: 'created_at' },
  })

  let products = filterProductsBySector(
    response.products,
    parentCategories,
    sector
  )

  if (industryHandle) {
    products = filterProductsByCategoryHandle(products, industryHandle)
  }

  if (listingType === 'service') {
    products = filterProductsByListingType(products, 'service')
  }

  const count = products.length
  const headline =
    listingType === 'service'
      ? category?.name || 'All services'
      : getCatalogHeadline(sector, category?.name)
  const clearHref = `${basePath}${category ? `/${category.handle}` : ''}${
    listingType === 'service'
      ? buildCatalogQuery(sectorId, industryHandle, 'service')
      : buildCatalogQuery(sectorId, industryHandle)
  }`
  const categoryInSector = category
    ? categoryMatchesSector(
        parentCategories.find((c) => c.id === category.id) || category,
        sector
      )
    : true

  return (
    <div className="tese-catalog-page">
      <nav className="tese-container pt-6 pb-2" aria-label="Breadcrumb">
        <ol className="tese-pdp-breadcrumb">
          <li>
            <LocalizedClientLink href="/">Home</LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href={`${basePath}${buildCatalogQuery(sectorId)}`}>
              Products
            </LocalizedClientLink>
          </li>
          {category && <li aria-current="page">{category.name}</li>}
        </ol>
      </nav>

      <div className="tese-catalog-band">
        <div className="tese-container tese-catalog-header">
          <div className="tese-catalog-header-text">
            <p className="tese-catalog-eyebrow">
              <span className="tese-catalog-eyebrow-dot" aria-hidden />
              Sustainable catalogue
            </p>
            <h1 className="tese-catalog-title">{headline}</h1>
            {sector.id !== 'all' && !category && (
              <p className="tese-catalog-subtitle">{sector.subheadline}</p>
            )}
            {category?.description && (
              <p className="tese-catalog-subtitle">{category.description}</p>
            )}
          </div>
          <div className="tese-catalog-header-actions">
            <span className="tese-catalog-count">
              {count} {count === 1 ? 'listing' : 'listings'}
            </span>
            <CatalogActiveSectorChip sector={sector} clearHref={clearHref} />
          </div>
        </div>

        <div className="tese-container tese-catalog-filters">
          <CatalogSectorTabs
            activeSectorId={sectorId}
            basePath={basePath}
            industryHandle={industryHandle}
            listingType={listingType}
          />
          <CatalogCategoryPills
            categories={sectorCategories}
            sector={sector}
            sectorId={sectorId}
            industryHandle={industryHandle}
            activeCategoryHandle={category?.handle}
            listingType={listingType}
          />
        </div>
      </div>

      <div className="tese-container tese-catalog-body">
        {!categoryInSector && sector.id !== 'all' && (
          <p className="tese-catalog-notice">
            This category is outside your selected sector. Listings below are
            filtered to {sector.label.toLowerCase()} only.
          </p>
        )}
        <CatalogProductGrid
          products={products}
          categories={parentCategories}
          emptyMessage={
            listingType === 'service'
              ? 'No services match your filters. Try another sector or browse all listings.'
              : sector.id !== 'all'
                ? `No listings in ${sector.label.toLowerCase()} match your filters.`
                : undefined
          }
        />
      </div>
    </div>
  )
}
