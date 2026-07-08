import { Carousel } from '@/components/cells'
import { FeaturedListingCard } from '@/components/organisms/FeaturedListingCard/FeaturedListingCard'
import { listProducts } from '@/lib/data/products'
import { dedupeCatalogGridProducts } from '@/lib/helpers/catalog-product'
import {
  buildCategoriesById,
  getProductSectorLabels,
} from '@/lib/helpers/sector-preferences'
import { getWishlistState } from '@/lib/helpers/wishlist-state'
import { SellerProps } from '@/types/seller'
import { Product } from '@/types/product'
import { HttpTypes } from '@medusajs/types'

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
  b2b = false,
  parentCategories = [],
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
  b2b?: boolean
  parentCategories?: HttpTypes.StoreProductCategory[]
}) => {
  let products = sellerProducts

  if (!products.length) {
    const {
      response: { products: fetched },
    } = await listProducts({
      countryCode: locale,
      queryParams: {
        limit: home ? 24 : undefined,
        order: 'created_at',
      },
      forceCache: !home,
    })
    products = fetched as Product[]
  }

  if (!products.length) return null

  const wishlistState = await getWishlistState(locale)
  const categoriesById = buildCategoriesById(parentCategories)

  if (b2b) {
    const gridItems = dedupeCatalogGridProducts(
      products as (HttpTypes.StoreProduct & { seller?: SellerProps })[]
    )

    return (
      <div className="tese-featured-grid">
        {gridItems.map(({ product, vendorCount, displayTitle }, index) => (
          <FeaturedListingCard
            key={product.id}
            product={product as HttpTypes.StoreProduct & { seller?: SellerProps }}
            index={index}
            sectorLabels={
              parentCategories.length
                ? getProductSectorLabels(product, categoriesById)
                : undefined
            }
            vendorCount={vendorCount}
            displayTitle={displayTitle}
            isLoggedIn={wishlistState.isLoggedIn}
            initiallyWishlisted={wishlistState.wishlistedIds.has(product.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full">
      <Carousel
        align="start"
        items={products.map((product, index) => (
          <div key={product.id} className="w-[280px] shrink-0">
            <FeaturedListingCard
              product={product as HttpTypes.StoreProduct & { seller?: SellerProps }}
              index={index}
              sectorLabels={getProductSectorLabels(
                product as HttpTypes.StoreProduct,
                categoriesById
              )}
              isLoggedIn={wishlistState.isLoggedIn}
              initiallyWishlisted={wishlistState.wishlistedIds.has(product.id)}
            />
          </div>
        ))}
      />
    </div>
  )
}
