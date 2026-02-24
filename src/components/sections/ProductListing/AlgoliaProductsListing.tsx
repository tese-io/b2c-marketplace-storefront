"use client"

import { HttpTypes } from "@medusajs/types"
import {
  ProductListingActiveFilters,
  ProductsPagination,
} from "@/components/organisms"
import { ProductFilters } from "@/components/products/ProductFilters"
import {
  ProductListingLoadingView,
  ProductListingNoResultsView,
  ProductListingProductsView,
} from "@/components/molecules"
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { useEffect, useMemo, useState } from "react"
import { searchProducts, aiSearchProducts } from "@/lib/data/products"
import { SparkIcon } from "@/icons"

const PRODUCT_CATEGORIES = [
  { value: 'clothing', label: 'Sustainable Clothing' },
  { value: 'home', label: 'Home & Living' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
]

export const AlgoliaProductsListing = ({
  category_id,
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  currency_code,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
  currency_code: string
}) => {
  const searchParams = useSearchParams()

  const facetFilters: string = getFacedFilters(searchParams)
  const query: string = searchParams.get("query") || ""
  const page: number = +(searchParams.get("page") || 1)
  const category = searchParams.get("category") || undefined

  const filters = `${
    seller_handle
      ? `NOT seller:null AND seller.handle:${seller_handle} AND `
      : "NOT seller:null AND "
  }NOT seller.store_status:SUSPENDED AND supported_countries:${locale} AND variants.prices.currency_code:${currency_code} AND variants.prices.amount > 0${
    category_id
      ? ` AND categories.id:${category_id}${
          collection_id !== undefined
            ? ` AND collections.id:${collection_id}`
            : ""
        } ${facetFilters}`
      : ` ${facetFilters}`
  }`

  return (
      <ProductsListing
        locale={locale}
        currency_code={currency_code}
        filters={filters}
        query={query}
        page={page}
        activeCategory={category}
      />
  )
}

const ProductsListing = ({
  locale,
  currency_code,
  filters,
  query,
  page,
  activeCategory,
}: {
  locale?: string
  currency_code: string
  filters: string
  query: string
  page: number
  activeCategory?: string
}) => {
  const [products, setProducts] = useState<
    (HttpTypes.StoreProduct & { seller?: any })[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [pages, setPages] = useState(1)
  const [aiMetadata, setAiMetadata] = useState<any>(null)

  const searchParams = useSearchParams()
  const useAiSearch = searchParams.get("ai_search") === "true"

  useEffect(() => {
    async function fetchProducts() {
      if (!locale) return

      try {
        setIsLoading(true)

        // Use AI search if ai_search parameter is true
        const result = useAiSearch
          ? await aiSearchProducts({
              query: query || "",
              page: page - 1,
              hitsPerPage: PRODUCT_LIMIT,
              currency_code,
              countryCode: locale,
              enable_ai: true,
            })
          : await searchProducts({
              query: query || undefined,
              page: page - 1,
              hitsPerPage: PRODUCT_LIMIT,
              filters,
              currency_code,
              countryCode: locale,
            })

        setProducts(result.products)
        setCount(result.nbHits)
        setPages(result.nbPages)
        setAiMetadata(result.ai_metadata || null)
      } catch (error) {
        setProducts([])
        setCount(0)
        setPages(0)
        setAiMetadata(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [locale, filters, query, page, currency_code, useAiSearch])

  if (isLoading && products.length === 0) return <ProductListingSkeleton />

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar with filters */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <ProductFilters
          categories={PRODUCT_CATEGORIES}
          activeCategory={activeCategory}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-h-[70vh]">
        <div className="flex justify-between w-full items-center mb-4">
          <div className="label-md">{`${count} listings`}</div>
        </div>

        {/* AI Search Indicator */}
        {useAiSearch && aiMetadata && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <SparkIcon size={16} className="text-purple-600" />
              <span className="font-medium text-purple-900">AI-Powered Search Active</span>
              {aiMetadata.confidence && (
                <span className="text-purple-600">
                  • Confidence: {Math.round(aiMetadata.confidence * 100)}%
                </span>
              )}
            </div>
            {aiMetadata.intent && (
              <p className="text-xs text-purple-700 mt-1 ml-6">
                {aiMetadata.intent}
              </p>
            )}
            {aiMetadata.applied_filters && (
              <details className="text-xs text-purple-600 mt-2 ml-6">
                <summary className="cursor-pointer hover:text-purple-800">
                  View applied filters
                </summary>
                <code className="block mt-1 p-2 bg-white rounded text-purple-900 overflow-x-auto">
                  {aiMetadata.applied_filters}
                </code>
              </details>
            )}
          </div>
        )}

        <div className="hidden md:block mb-4">
          <ProductListingActiveFilters />
        </div>

        <div className="w-full flex flex-col">
          {isLoading && <ProductListingLoadingView />}

          {!isLoading && !products.length && <ProductListingNoResultsView />}

          {!isLoading && products.length > 0 && (
            <ProductListingProductsView products={products} />
          )}

          <div className="mt-auto">
            <ProductsPagination pages={pages} />
          </div>
        </div>
      </div>
    </div>
  )
}
