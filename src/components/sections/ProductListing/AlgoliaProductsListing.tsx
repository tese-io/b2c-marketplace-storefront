"use client"

import { HttpTypes } from "@medusajs/types"
import { ProductsPagination } from "@/components/organisms"
import {
  ProductListingLoadingView,
  ProductListingProductsView,
} from "@/components/molecules"
import { ListingSearchToolbar } from "@/components/molecules/ListingSearchToolbar/ListingSearchToolbar"
import { SellerProductsEmpty } from "@/components/molecules/SellerProductsEmpty/SellerProductsEmpty"
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { useEffect, useState } from "react"
import { searchProducts } from "@/lib/data/products"
import { FacetCounts } from "@/components/organisms/ProductSidebar/AlgoliaProductSidebar"

export const AlgoliaProductsListing = ({
  category_id,
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  currency_code,
  orbitUrl,
  sellerName,
  isLoggedIn,
  wishlistedIds,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
  currency_code: string
  orbitUrl?: string | null
  sellerName?: string
  isLoggedIn?: boolean
  wishlistedIds?: string[]
}) => {
  const searchParams = useSearchParams()

  const facetFilters: string = getFacedFilters(searchParams)
  const query: string = searchParams.get("query") || ""
  const page: number = +(searchParams.get("page") || 1)

  const filters = `${
    seller_handle
      ? `has_seller:true AND seller.handle:${seller_handle} AND `
      : "has_seller:true AND "
  }NOT seller.store_status:SUSPENDED AND supported_countries:${locale} AND variants.prices.currency_code:${currency_code} AND variants.prices.amount > 0${
    category_id
      ? ` AND categories.id:${category_id}${
          collection_id !== undefined
            ? ` AND collection.id:${collection_id}`
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
        seller_handle={seller_handle}
        orbitUrl={orbitUrl}
        sellerName={sellerName}
        isLoggedIn={isLoggedIn}
        wishlistedIds={wishlistedIds}
      />
  )
}

const ProductsListing = ({
  locale,
  currency_code,
  filters,
  query,
  page,
  seller_handle,
  orbitUrl,
  sellerName,
  isLoggedIn,
  wishlistedIds,
}: {
  locale?: string
  currency_code: string
  filters: string
  query: string
  page: number
  seller_handle?: string
  orbitUrl?: string | null
  sellerName?: string
  isLoggedIn?: boolean
  wishlistedIds?: string[]
}) => {
  const [products, setProducts] = useState<
    (HttpTypes.StoreProduct & { seller?: any })[]
  >([])
  const [facets, setFacets] = useState<Record<string, FacetCounts>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    async function fetchProducts() {
      if (!locale) return

      try {
        setIsLoading(true)
        const result = await searchProducts({
          query: query || undefined,
          page: page - 1,
          hitsPerPage: PRODUCT_LIMIT,
          filters,
          currency_code,
          countryCode: locale,
        })

        setProducts(result.products)
        setFacets(result.facets)
        setCount(result.nbHits)
        setPages(result.nbPages)
      } catch (error) {
        setProducts([])
        setFacets({})
        setCount(0)
        setPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [locale, filters, query, page, currency_code])

  if (isLoading && products.length === 0) return <ProductListingSkeleton />

  const searchPlaceholder = seller_handle
    ? `Search ${sellerName || 'this supplier'}'s listings…`
    : 'Search listings…'

  return (
    <div className="tese-seller-listing min-h-[50vh]">
      <ListingSearchToolbar
        count={count}
        facets={facets}
        showSectors={!seller_handle}
        searchPlaceholder={searchPlaceholder}
      />
      <div className="tese-seller-grid-wrap">
        {isLoading && <ProductListingLoadingView />}

        {!isLoading && !products.length && seller_handle && (
          <SellerProductsEmpty sellerName={sellerName} orbitUrl={orbitUrl} />
        )}

        {!isLoading && !products.length && !seller_handle && (
          <div className="tese-seller-empty">
            <h2 className="tese-seller-empty-title">No results</h2>
            <p className="tese-seller-empty-hint">
              Sorry, we couldn&apos;t find any results for your criteria.
            </p>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <ProductListingProductsView
            products={products}
            isLoggedIn={isLoggedIn}
            wishlistedIds={wishlistedIds}
            wideLayout
          />
        )}

        <div className="mt-auto">
          <ProductsPagination pages={pages} />
        </div>
      </div>
    </div>
  )
}
