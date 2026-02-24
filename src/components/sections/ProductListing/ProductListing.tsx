import {
  ProductListingActiveFilters,
  ProductListingHeader,
  ProductSidebar,
  ProductsList,
  ProductsPagination,
} from "@/components/organisms"
import { PRODUCT_LIMIT } from "@/const"
import { listProductsWithSort } from "@/lib/data/products"

export const ProductListing = async ({
  category_id,
  collection_id,
  seller_id,
  showSidebar = false,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  listing_type,
}: {
  category_id?: string
  collection_id?: string
  seller_id?: string
  showSidebar?: boolean
  locale?: string
  listing_type?: 'product' | 'service'
}) => {
  const { response } = await listProductsWithSort({
    seller_id,
    category_id,
    collection_id,
    countryCode: locale,
    sortBy: "created_at",
    queryParams: {
      limit: PRODUCT_LIMIT,
    },
    listing_type,
  })

  const { products, count } = response

  const pages = Math.ceil(count / PRODUCT_LIMIT) || 1

  return (
    <div className="py-4" data-testid="product-listing-container">
      <ProductListingHeader
        total={count}
        listingType={listing_type}
        showTypeFilters={!listing_type}
      />
      <div className="hidden md:block">
        <ProductListingActiveFilters />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-4">
        {showSidebar && <ProductSidebar />}
        <section className={showSidebar ? "col-span-3" : "col-span-4"} data-testid="product-listing-section">
          <div className="flex flex-wrap gap-4" data-testid="product-list">
            <ProductsList products={products} />
          </div>
          <ProductsPagination pages={pages} />
        </section>
      </div>
    </div>
  )
}
