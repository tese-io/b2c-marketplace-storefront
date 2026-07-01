import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

import { HomeProductsCarousel } from '@/components/organisms'
import type { SectorDefinition, SectorId } from '@/data/sectors'
import { HttpTypes } from '@medusajs/types'
import { listProducts } from '@/lib/data/products'
import { dedupeCatalogGridProducts } from '@/lib/helpers/catalog-product'
import {
  buildCatalogQuery,
  filterProductsBySector,
  findCategoryIdByHandle,
} from '@/lib/helpers/sector-preferences'
import { Product } from '@/types/product'

export const HomeProductSection = async ({
  heading,
  subtitle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || 'pl',
  products = [],
  home = false,
  sector,
  industryHandle,
  parentCategories = [],
}: {
  heading: string
  subtitle?: string
  locale?: string
  products?: Product[]
  home?: boolean
  sector?: SectorDefinition
  industryHandle?: string
  parentCategories?: HttpTypes.StoreProductCategory[]
}) => {
  const categoryId = industryHandle
    ? findCategoryIdByHandle(parentCategories, industryHandle)
    : undefined

  const {
    response: { products: fetchedProducts },
  } = await listProducts({
    countryCode: locale,
    category_id: categoryId,
    queryParams: {
      limit: home ? 24 : undefined,
      order: 'created_at',
      handle: home
        ? undefined
        : products.map((product) => product.handle),
    },
    forceCache: !home && !categoryId && !(sector && sector.id !== 'all'),
  })

  let displayProducts = products.length ? products : fetchedProducts

  if (sector && sector.id !== 'all' && !categoryId) {
    displayProducts = filterProductsBySector(
      displayProducts,
      parentCategories,
      sector
    )
  }

  displayProducts = displayProducts.slice(0, 8)

  if (!displayProducts.length) return null

  const catalogQuery = buildCatalogQuery(
    (sector?.id || 'all') as SectorId,
    industryHandle
  )

  return (
    <section className="tese-featured-section" aria-labelledby="featured-listings-heading">
      <div className="tese-featured-section-header">
        <div className="tese-featured-section-intro">
          <p className="tese-featured-eyebrow">
            <span className="tese-featured-eyebrow-dot" aria-hidden />
            Verified inventory
          </p>
          <h2
            id="featured-listings-heading"
            className="tese-featured-heading"
          >
            {heading}
          </h2>
          {subtitle && (
            <p className="tese-featured-subtitle">{subtitle}</p>
          )}
        </div>

        <div className="tese-featured-section-actions">
          <span className="tese-featured-count">
            {displayProducts.length} {displayProducts.length === 1 ? 'listing' : 'listings'}
          </span>
          <LocalizedClientLink
            href={`/categories${catalogQuery}`}
            className="tese-featured-view-all"
          >
            Browse all
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>

      <HomeProductsCarousel
        locale={locale}
        sellerProducts={displayProducts}
        home={home}
        b2b
        parentCategories={parentCategories}
      />
    </section>
  )
}
