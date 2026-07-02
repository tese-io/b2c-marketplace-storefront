import { Suspense } from 'react'
import { ProductListingSkeleton } from '../ProductListingSkeleton/ProductListingSkeleton'
import { AlgoliaProductsListing, ProductListing } from '@/components/sections'
import { TabsContent } from '@/components/molecules'
import { SellerReviewTab } from '@/components/cells'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import clsx from 'clsx'
import type { SellerOrbitProfile } from '@/lib/data/seller-orbit'
import { getWishlistState } from '@/lib/helpers/wishlist-state'

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

export const SellerTabs = async ({
  tab,
  seller_handle,
  seller_id,
  locale,
  currency_code,
  orbit,
  seller_name,
}: {
  tab: string
  seller_handle: string
  seller_id: string
  locale: string
  currency_code: string
  orbit?: SellerOrbitProfile | null
  seller_name?: string
}) => {
  const orbitUrl = orbit?.available ? orbit.url : null
  const wishlistState = await getWishlistState(locale)

  const tabsList = [
    { label: 'products', link: `/sellers/${seller_handle}/` },
    {
      label: 'reviews',
      link: `/sellers/${seller_handle}/reviews`,
    },
  ]

  return (
    <div className="tese-seller-tabs-wrap">
      <nav className="tese-seller-tabs" aria-label="Seller sections">
        {tabsList.map(({ label, link }) => {
          const isActive = tab === label.toLowerCase()
          return (
            <LocalizedClientLink
              key={label}
              href={link}
              className={clsx('tese-seller-tab', isActive && 'tese-seller-tab-active')}
            >
              {label}
            </LocalizedClientLink>
          )
        })}
      </nav>
      <div className="tese-seller-content-panel">
        <TabsContent value="products" activeTab={tab}>
          <div className="tese-seller-listing">
            <Suspense fallback={<div data-testid="seller-tabs-products-loading"><ProductListingSkeleton /></div>}>
              {!ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
                <ProductListing
                  showSidebar
                  seller_id={seller_id}
                  locale={locale}
                  orbitUrl={orbitUrl}
                  sellerName={seller_name}
                />
              ) : (
                <AlgoliaProductsListing
                  locale={locale}
                  seller_handle={seller_handle}
                  currency_code={currency_code}
                  orbitUrl={orbitUrl}
                  sellerName={seller_name}
                  isLoggedIn={wishlistState.isLoggedIn}
                  wishlistedIds={Array.from(wishlistState.wishlistedIds)}
                />
              )}
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="reviews" activeTab={tab}>
          <Suspense fallback={<div data-testid="seller-tabs-reviews-loading">Loading...</div>}>
            <SellerReviewTab seller_handle={seller_handle} />
          </Suspense>
        </TabsContent>
      </div>
    </div>
  )
}
