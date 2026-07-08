import { HttpTypes } from "@medusajs/types"

import { FeaturedListingCard } from "../FeaturedListingCard/FeaturedListingCard"
import { getProductSectorLabels } from "@/lib/helpers/sector-preferences"
import { SellerProps } from "@/types/seller"

const EMPTY_CATEGORIES = new Map<string, HttpTypes.StoreProductCategory>()

export const ProductsList = ({
  products,
}: {
  products: HttpTypes.StoreProduct[]
}) => {
  return (
    <>
      {products.map((product, index) => (
        <FeaturedListingCard
          key={product.id}
          product={product as HttpTypes.StoreProduct & { seller?: SellerProps }}
          index={index}
          sectorLabels={getProductSectorLabels(product, EMPTY_CATEGORIES)}
        />
      ))}
    </>
  )
}
