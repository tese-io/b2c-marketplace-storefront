import { HttpTypes } from '@medusajs/types'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { CatalogFilterDrawer } from '@/components/organisms/CatalogFilterDrawer/CatalogFilterDrawer'
import { ProductListingActiveFilters } from '@/components/organisms/ProductListingActiveFilters/ProductListingActiveFilters'
import { ProductsPagination } from '@/components/organisms/ProductsPagination/ProductsPagination'
import { PRODUCT_LIMIT } from '@/const'
import type { SectorDefinition, SectorId } from '@/data/sectors'
import {
  CATALOG_DEFAULT_SUBTITLE,
  CATALOG_EYEBROW,
  catalogEmptyMessage,
  getCategoryDescription,
} from '@/data/explorer-copy'
import { TOPIC_FILTER_SECTION_LABEL } from '@/data/topics'
import { listCategories } from '@/lib/data/categories'
import { searchProducts } from '@/lib/data/products'
import { getRegion } from '@/lib/data/regions'
import {
  CATALOG_FACETS,
  buildCatalogFilters,
  buildFacetFilterClauses,
  type FacetFilterParams,
} from '@/lib/helpers/catalog-search'
import { getWishlistState } from '@/lib/helpers/wishlist-state'
import {
  buildCatalogQuery,
  categoryMatchesSector,
  type ListingType,
} from '@/lib/helpers/sector-preferences'

import { CatalogActiveSectorChip } from './CatalogActiveSectorChip'
import { CatalogListingTypeTabs } from './CatalogListingTypeTabs'
import { CatalogProductGrid } from './CatalogProductGrid'
import { CatalogSectorTabs, getCatalogHeadline } from './CatalogSectorTabs'

export async function CatalogPage({
  locale,
  sector,
  sectorId,
  industryHandle,
  category,
  listingType,
  query,
  page,
  facetParams = {},
}: {
  locale: string
  sector: SectorDefinition
  sectorId: SectorId
  industryHandle?: string
  category?: HttpTypes.StoreProductCategory
  listingType?: ListingType
  query?: string
  page?: number
  facetParams?: FacetFilterParams
}) {
  const { parentCategories } = await listCategories()
  const basePath = '/categories'

  const currentPage = Math.max(1, Number(page) || 1)
  const facetClause = buildFacetFilterClauses(facetParams).join(' AND ')
  const filters = [
    buildCatalogFilters({
      sector,
      industryHandle,
      categoryId: category?.id,
      listingType,
    }),
    facetClause,
  ]
    .filter(Boolean)
    .join(' AND ')

  const productFilters = [
    buildCatalogFilters({
      sector,
      industryHandle,
      categoryId: category?.id,
    }),
    facetClause,
  ]
    .filter(Boolean)
    .join(' AND ')

  const serviceFilters = [
    buildCatalogFilters({
      sector,
      industryHandle,
      categoryId: category?.id,
      listingType: 'service',
    }),
    facetClause,
  ]
    .filter(Boolean)
    .join(' AND ')

  const [region, wishlistState] = await Promise.all([
    getRegion(locale),
    getWishlistState(locale),
  ])

  const currencyCode = region?.currency_code

  const [result, productCountResult, serviceCountResult] = await Promise.all([
    searchProducts({
      query: query || undefined,
      page: currentPage - 1,
      hitsPerPage: PRODUCT_LIMIT,
      filters,
      facets: CATALOG_FACETS,
      currency_code: currencyCode,
      countryCode: locale,
    }),
    searchProducts({
      query: query || undefined,
      page: 0,
      // hitsPerPage must be >= 1 (API validator) — we only need nbHits
      hitsPerPage: 1,
      filters: productFilters,
      facets: [],
      currency_code: currencyCode,
      countryCode: locale,
    }),
    searchProducts({
      query: query || undefined,
      page: 0,
      hitsPerPage: 1,
      filters: serviceFilters,
      facets: [],
      currency_code: currencyCode,
      countryCode: locale,
    }),
  ])

  const products = result.products
  const count = result.nbHits
  const productTabCount = productCountResult.nbHits
  const serviceTabCount = serviceCountResult.nbHits
  const headline = query
    ? `Results for “${query}”`
    : listingType === 'service'
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
              {CATALOG_EYEBROW}
            </p>
            <h1 className="tese-catalog-title">{headline}</h1>
            {query && (
              <p className="tese-catalog-subtitle">
                Searching the full catalogue
                {sector.id !== 'all' ? ` within ${sector.label.toLowerCase()}` : ''}.{' '}
                <LocalizedClientLink href={clearHref} className="underline">
                  Clear search
                </LocalizedClientLink>
              </p>
            )}
            {!query && sector.id !== 'all' && !category && (
              <p className="tese-catalog-subtitle">{sector.explorerIntro}</p>
            )}
            {!query && sector.id === 'all' && !category && (
              <p className="tese-catalog-subtitle">{CATALOG_DEFAULT_SUBTITLE}</p>
            )}
            {!query && category && (
              <p className="tese-catalog-subtitle">
                {getCategoryDescription(category.handle || '', category.description) ||
                  sector.explorerIntro}
              </p>
            )}
            {!query && sector.topicTags.length > 0 && (
              <div className="tese-catalog-topic-tags" aria-label={TOPIC_FILTER_SECTION_LABEL}>
                {sector.topicTags.map((tag) => (
                  <span key={tag} className="tese-catalog-topic-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="tese-catalog-header-actions">
            <span className="tese-catalog-count">
              {count} {count === 1 ? 'listing' : 'listings'}
            </span>
            <CatalogActiveSectorChip sector={sector} clearHref={clearHref} />
          </div>
        </div>

        <div className="tese-container tese-catalog-toolbar">
          <CatalogListingTypeTabs
            activeListingType={listingType}
            sectorId={sectorId}
            industryHandle={industryHandle}
            productCount={productTabCount}
            serviceCount={serviceTabCount}
          />
          <CatalogSectorTabs
            activeSectorId={sectorId}
            basePath={basePath}
            industryHandle={industryHandle}
            listingType={listingType}
          />
          <div className="tese-catalog-toolbar-actions">
            <CatalogFilterDrawer
              facets={result.facets}
              resultCount={count}
              showSectors={false}
              showCategories={!category}
              categoryLabels={Object.fromEntries(
                parentCategories
                  .filter((c) => c.handle)
                  .map((c) => [c.handle as string, c.name])
              )}
            />
          </div>
        </div>
      </div>

      <div className="tese-container tese-catalog-body">
        {!categoryInSector && sector.id !== 'all' && (
          <p className="tese-catalog-notice">
            This category is outside your selected sector. Listings below are
            filtered to {sector.label.toLowerCase()} only.
          </p>
        )}
        {facetClause.length > 0 && (
          <div className="mb-4">
            <ProductListingActiveFilters
              exclude={['sector', 'industry', 'listing', 'query']}
            />
          </div>
        )}
        <CatalogProductGrid
          products={products}
          categories={parentCategories}
          wishlistState={wishlistState}
          emptyMessage={catalogEmptyMessage({
            query,
            sectorLabel: sector.id !== 'all' ? sector.label : undefined,
            listingType,
          })}
        />
        {result.nbPages > 1 && <ProductsPagination pages={result.nbPages} />}
      </div>
    </div>
  )
}
