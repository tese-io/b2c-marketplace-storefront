'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { B2BProductGallery } from '@/components/organisms/B2BProductGallery/B2BProductGallery'
import { B2BProductPurchasePanel } from '@/components/organisms/B2BProductPurchasePanel/B2BProductPurchasePanel'
import { B2BProductSellerBar } from '@/components/organisms/B2BProductSellerBar/B2BProductSellerBar'
import { BrandVendorPicker } from '@/components/organisms/BrandVendorPicker/BrandVendorPicker'
import type { CatalogListing } from '@/lib/helpers/catalog-product'
import {
  findListingByBrandSlug,
  getAggregatedCatalogSpecs,
  getCatalogDisplayTitle,
} from '@/lib/helpers/catalog-product'
import {
  dedupeCatalogGridProducts,
  parsePreferredBrandSlugs,
  sortCatalogBrands,
} from '@/lib/helpers/catalog-product'
import type { ProcurementSpec } from '@/lib/helpers/product-procurement'
import { getProcurementSpecs } from '@/lib/helpers/product-procurement'
import { SellerProps } from '@/types/seller'
import { Wishlist } from '@/types/wishlist'
import { HttpTypes } from '@medusajs/types'

export function B2BCatalogProductShell({
  listings,
  catalogHandle,
  locale,
  user,
  wishlist,
  sectorLabels,
  initialBrandSlug,
  sectorId,
  preferredBrandSlugs,
}: {
  listings: CatalogListing[]
  catalogHandle: string
  locale: string
  user: HttpTypes.StoreCustomer | null
  wishlist?: Wishlist
  sectorLabels?: string[]
  initialBrandSlug?: string
  sectorId?: SectorId
  preferredBrandSlugs?: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const brands = useMemo(
    () =>
      sortCatalogBrands(listings, {
        sectorId,
        preferredBrandSlugs,
      }),
    [listings, sectorId, preferredBrandSlugs]
  )

  const defaultSlug = brands[0]?.slug || ''
  const [selectedSlug, setSelectedSlug] = useState(
    initialBrandSlug || defaultSlug
  )

  const selectedListing = useMemo(
    () => findListingByBrandSlug(listings, selectedSlug),
    [listings, selectedSlug]
  )

  const catalogTitle = getCatalogDisplayTitle(listings)
  const aggregatedSpecs = useMemo(
    () => getAggregatedCatalogSpecs(listings),
    [listings]
  )
  const listingSpecs = useMemo(
    () => getProcurementSpecs(selectedListing),
    [selectedListing]
  )

  const handleBrandSelect = useCallback(
    (slug: string) => {
      setSelectedSlug(slug)
      const params = new URLSearchParams(searchParams.toString())
      if (slug === brands[0]?.slug) {
        params.delete('brand')
      } else {
        params.set('brand', slug)
      }
      const query = params.toString()
      router.replace(
        query
          ? `/${locale}/products/${catalogHandle}?${query}`
          : `/${locale}/products/${catalogHandle}`,
        { scroll: false }
      )
    },
    [brands, catalogHandle, locale, router, searchParams]
  )

  return (
    <>
      <section className="tese-container py-6 lg:py-10">
        <div className="tese-pdp-hero-grid">
          <div data-testid="product-gallery-container">
            <B2BProductGallery
              images={selectedListing.images?.length ? selectedListing.images : listings[0]?.images}
              title={catalogTitle}
            />
          </div>
          <div data-testid="product-details-container" className="tese-catalog-pdp-panel">
            <div className="tese-pdp-panel" data-testid="catalog-product-header">
              <div className="tese-pdp-panel-top">
                <div className="min-w-0 flex-1">
                  {selectedListing.categories?.[0]?.name && (
                    <p className="tese-pdp-category">
                      {selectedListing.categories[0].name}
                    </p>
                  )}
                  <h1 className="tese-pdp-title">{catalogTitle}</h1>
                  {selectedListing.subtitle && (
                    <p className="tese-pdp-subtitle">{selectedListing.subtitle}</p>
                  )}
                  {sectorLabels && sectorLabels.length > 0 && (
                    <div className="tese-pdp-sector-tags">
                      {sectorLabels.map((label) => (
                        <span key={label} className="tese-pdp-sector-tag">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <BrandVendorPicker
                brands={brands}
                selectedSlug={selectedSlug}
                onSelect={handleBrandSelect}
              />

              <CatalogSpecTable
                aggregatedSpecs={aggregatedSpecs}
                listingSpecs={listingSpecs}
                brandName={brands.find((b) => b.slug === selectedSlug)?.name}
              />
            </div>

            <B2BProductPurchasePanel
              product={
                selectedListing as HttpTypes.StoreProduct & { seller?: SellerProps }
              }
              locale={locale}
              user={user}
              wishlist={wishlist}
              hideHeader
              catalogTitle={catalogTitle}
            />
          </div>
        </div>
      </section>

      {selectedListing.seller && (
        <section className="tese-container pb-10">
          <B2BProductSellerBar seller={selectedListing.seller} />
        </section>
      )}
    </>
  )
}

function CatalogSpecTable({
  aggregatedSpecs,
  listingSpecs,
  brandName,
}: {
  aggregatedSpecs: ProcurementSpec[]
  listingSpecs: ProcurementSpec[]
  brandName?: string
}) {
  const [viewAll, setViewAll] = useState(false)
  const specs = viewAll ? aggregatedSpecs : listingSpecs

  if (!specs.length) return null

  return (
    <div className="tese-catalog-pdp-specs">
      <div className="tese-catalog-pdp-specs-header">
        <p className="tese-catalog-pdp-specs-label">Specification</p>
        {aggregatedSpecs.length > listingSpecs.length && (
          <button
            type="button"
            className="tese-catalog-pdp-specs-toggle"
            onClick={() => setViewAll((v) => !v)}
          >
            {viewAll ? `Show ${brandName || 'brand'} only` : 'Compare all brands'}
          </button>
        )}
      </div>
      <div className="tese-pdp-spec-table" data-testid="catalog-spec-table">
        <table>
          <tbody>
            {specs.map((spec) => (
              <tr key={spec.label}>
                <th scope="row">{spec.label}</th>
                <td>{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
