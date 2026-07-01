import { HttpTypes } from '@medusajs/types'

import { FeaturedListingCard } from '@/components/organisms/FeaturedListingCard/FeaturedListingCard'
import { dedupeCatalogGridProducts } from '@/lib/helpers/catalog-product'
import {
  buildCategoriesById,
  getProductSectorLabels,
} from '@/lib/helpers/sector-preferences'
import { SellerProps } from '@/types/seller'

type CatalogProduct = HttpTypes.StoreProduct & { seller?: SellerProps }

export function CatalogProductGrid({
  products,
  categories,
  emptyMessage,
}: {
  products: CatalogProduct[]
  categories: HttpTypes.StoreProductCategory[]
  emptyMessage?: string
}) {
  if (!products.length) {
    return (
      <div className="tese-catalog-empty">
        <p>{emptyMessage || 'No listings match your filters.'}</p>
        <p className="tese-catalog-empty-hint">
          Try another sector or browse all products.
        </p>
      </div>
    )
  }

  const categoriesById = buildCategoriesById(categories)
  const gridItems = dedupeCatalogGridProducts(products)

  return (
    <div className="tese-catalog-grid">
      {gridItems.map(({ product, vendorCount, displayTitle }, index) => (
        <FeaturedListingCard
          key={product.id}
          product={product}
          index={index}
          sectorLabels={getProductSectorLabels(product, categoriesById)}
          vendorCount={vendorCount}
          displayTitle={displayTitle}
        />
      ))}
    </div>
  )
}
