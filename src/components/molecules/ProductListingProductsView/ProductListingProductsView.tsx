import { HttpTypes } from "@medusajs/types"

import { FeaturedListingCard } from "@/components/organisms/FeaturedListingCard/FeaturedListingCard"
import { getProductSectorLabels } from "@/lib/helpers/sector-preferences"
import { SellerProps } from "@/types/seller"

const EMPTY_CATEGORIES = new Map<string, HttpTypes.StoreProductCategory>()

interface Props {
  products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
  isLoggedIn?: boolean
  wishlistedIds?: string[]
  wideLayout?: boolean
}

const ProductListingProductsView = ({
  products,
  isLoggedIn,
  wishlistedIds,
  wideLayout = false,
}: Props) => (
  <div className="w-full">
    <div
      className={
        wideLayout ? 'tese-catalog-grid tese-catalog-grid--wide' : 'tese-catalog-grid'
      }
    >
      {products.map((product, index) => (
        <FeaturedListingCard
          key={product.id}
          product={product}
          index={index}
          sectorLabels={getProductSectorLabels(product, EMPTY_CATEGORIES)}
          isLoggedIn={isLoggedIn}
          initiallyWishlisted={wishlistedIds?.includes(product.id)}
        />
      ))}
    </div>
  </div>
)

export default ProductListingProductsView
