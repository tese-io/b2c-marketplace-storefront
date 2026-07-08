import { HttpTypes } from '@medusajs/types'
import { isEmpty } from 'lodash'
import { redirect } from 'next/navigation'

import { WishlistItem } from '@/components/cells'
import { LoginForm } from '@/components/molecules'
import { WorkspaceAccountEmpty } from '@/components/sections/SourcingAppShell/WorkspaceAccountEmpty'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'
import { getUserWishlists } from '@/lib/data/wishlist'
import { Wishlist as WishlistType } from '@/types/wishlist'

export default async function WishlistPage ({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const user = await retrieveCustomer()
  const { locale } = await params

  let wishlist: WishlistType = { products: [] }
  if (user) {
    wishlist = await getUserWishlists({ countryCode: locale })
  }

  const count = wishlist?.products?.length || 0

  if (!user) {
    redirect('/login')
  }

  return (
    <WorkspaceAccountPage title="Wishlist" testId="wishlist-page">
      <div data-testid="wishlist-container">
        {isEmpty(wishlist?.products) ? (
          <WorkspaceAccountEmpty
            title="Your wishlist is empty"
            description="Save products you are interested in and come back to them anytime."
            primaryLabel="Start AI Sourcing"
            primaryHref="/sourcing"
            secondaryLabel="Browse catalogue"
            secondaryHref="/categories"
            testId="wishlist-empty-state"
          />
        ) : (
          <div className="flex flex-col gap-6">
            <p data-testid="wishlist-count">{count} listings</p>
            <div
              className="flex flex-wrap gap-4 max-md:justify-center"
              data-testid="wishlist-products-list"
            >
              {wishlist?.products?.map((product) => (
                <WishlistItem
                  key={product.id}
                  product={
                    product as HttpTypes.StoreProduct & {
                      calculated_amount: number
                      currency_code: string
                    }
                  }
                  wishlist={wishlist}
                  user={user}
                  testIdPrefix={`wishlist-item-${product.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </WorkspaceAccountPage>
  )
}
