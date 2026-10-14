import { redirect } from 'next/navigation'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { B2BCatalogProductShell } from '@/components/organisms/B2BCatalogProductShell/B2BCatalogProductShell'
import { B2BProductContent } from '@/components/organisms/B2BProductContent/B2BProductContent'
import { B2BProductGallery } from '@/components/organisms/B2BProductGallery/B2BProductGallery'
import { B2BProductPurchasePanel } from '@/components/organisms/B2BProductPurchasePanel/B2BProductPurchasePanel'
import { B2BProductSellerBar } from '@/components/organisms/B2BProductSellerBar/B2BProductSellerBar'
import { listCategories } from '@/lib/data/categories'
import { listCatalogListings, listProducts } from '@/lib/data/products'
import { retrieveCustomer } from '@/lib/data/customer'
import { getUserWishlists } from '@/lib/data/wishlist'
import {
  getCatalogDisplayTitle,
  getCatalogHandle,
  getBrandSlug,
  isCatalogGroup,
  parsePreferredBrandSlugs,
} from '@/lib/helpers/catalog-product'
import type { SectorId } from '@/data/sectors'
import {
  buildCategoriesById,
  getProductSectorLabels,
} from '@/lib/helpers/sector-preferences'
import { SellerProps } from '@/types/seller'
import { Wishlist } from '@/types/wishlist'
import { HttpTypes } from '@medusajs/types'

import NotFound from '@/app/not-found'
import { HomeProductSection } from '../HomeProductSection/HomeProductSection'

export const ProductDetailsPage = async ({
  handle,
  locale,
  localeSegment,
  brand,
  sectorId = 'all',
}: {
  handle: string
  locale: string
  /** Full `{language}-{market}` segment — links must keep the language. */
  localeSegment: string
  brand?: string
  sectorId?: SectorId
}) => {
  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true,
  }).then(({ response }) => response.products[0])

  if (!prod) return null

  if (prod.seller?.store_status === 'SUSPENDED') {
    return NotFound()
  }

  const catalogHandle = getCatalogHandle(prod) || handle
  const listings = await listCatalogListings({
    countryCode: locale,
    catalogHandle,
  })

  if (getCatalogHandle(prod) && prod.handle !== catalogHandle) {
    redirect(
      `/${localeSegment}/products/${catalogHandle}?brand=${encodeURIComponent(getBrandSlug(prod))}`
    )
  }

  const user = await retrieveCustomer().catch(() => null)
  let wishlist: Wishlist = { products: [] }
  if (user) {
    wishlist = await getUserWishlists({ countryCode: locale })
  }

  const { parentCategories } = await listCategories()
  const categoriesById = buildCategoriesById(parentCategories)
  const primaryListing = listings[0] || prod
  const sectorLabels = getProductSectorLabels(primaryListing, categoriesById)
  const category = primaryListing.categories?.[0]
  const isCatalog = isCatalogGroup(listings)
  const displayTitle = isCatalog
    ? getCatalogDisplayTitle(listings)
    : prod.title

  const preferredBrandSlugs = parsePreferredBrandSlugs(
    user?.metadata as Record<string, unknown> | undefined
  )

  const categoryId = category?.id
  let relatedProducts: HttpTypes.StoreProduct[] = []

  if (categoryId) {
    const { response } = await listProducts({
      countryCode: locale,
      category_id: categoryId,
      queryParams: { limit: 12 },
    })
    const excludeIds = new Set(listings.map((l) => l.id))
    relatedProducts = response.products
      .filter((p) => !excludeIds.has(p.id))
      .slice(0, 4)
  }

  return (
    <div data-testid="product-details-page">
      <nav className="tese-container pt-6 pb-2" aria-label="Breadcrumb">
        <ol className="tese-pdp-breadcrumb">
          <li>
            <LocalizedClientLink href="/">Home</LocalizedClientLink>
          </li>
          {category && (
            <li>
              <LocalizedClientLink href={`/categories/${category.handle}`}>
                {category.name}
              </LocalizedClientLink>
            </li>
          )}
          <li aria-current="page">{displayTitle}</li>
        </ol>
      </nav>

      {isCatalog ? (
        <B2BCatalogProductShell
          localeSegment={localeSegment}
          listings={listings}
          catalogHandle={catalogHandle}
          locale={locale}
          user={user}
          wishlist={wishlist}
          sectorLabels={sectorLabels}
          initialBrandSlug={brand}
          sectorId={sectorId}
          preferredBrandSlugs={preferredBrandSlugs}
        />
      ) : (
        <>
          <section className="tese-container py-6 lg:py-10">
            <div className="tese-pdp-hero-grid">
              <div data-testid="product-gallery-container">
                <B2BProductGallery
                  images={prod.images}
                  title={prod.title || 'Product'}
                />
              </div>
              <div data-testid="product-details-container">
                <B2BProductPurchasePanel
                  product={prod as HttpTypes.StoreProduct & { seller?: SellerProps }}
                  locale={locale}
                  user={user}
                  wishlist={wishlist}
                  sectorLabels={sectorLabels}
                />
              </div>
            </div>
          </section>

          {prod.seller && (
            <section className="tese-container pb-10">
              <B2BProductSellerBar seller={prod.seller} />
            </section>
          )}
        </>
      )}

      <section className="tese-container pb-10 lg:pb-14">
        <B2BProductContent product={primaryListing} />
      </section>

      {relatedProducts.length > 0 && (
        <div className="tese-featured-band py-14 lg:py-16">
          <div className="tese-container">
            <HomeProductSection
              heading="Related products"
              subtitle="Similar sustainable materials from verified suppliers."
              locale={locale}
              products={
                relatedProducts as Parameters<typeof HomeProductSection>[0]['products']
              }
              parentCategories={parentCategories}
            />
          </div>
        </div>
      )}
    </div>
  )
}
