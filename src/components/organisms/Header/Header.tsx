import { HttpTypes } from "@medusajs/types"
import { Suspense } from "react"

import { TeseLogo } from "@/components/atoms/TeseLogo/TeseLogo"
import { MobileNavbar } from "@/components/cells"
import { HeaderMainNav } from "@/components/molecules/HeaderMainNav/HeaderMainNav"
import { HeaderSearchNav } from "@/components/molecules/HeaderSearch/HeaderSearchNav"
import { HeaderToolbar } from "@/components/molecules/HeaderToolbar/HeaderToolbar"
import { PriceTicker } from "@/components/molecules/PriceTicker/PriceTicker"
import { listCategories } from "@/lib/data/categories"
import { listRegions } from "@/lib/data/regions"
import { getUserWishlists } from "@/lib/data/wishlist"
import { retrieveCustomer } from "@/lib/data/customer"
import { Wishlist } from "@/types/wishlist"

export const Header = async ({ locale }: { locale: string }) => {
  const user = await retrieveCustomer().catch(() => null)
  const isLoggedIn = Boolean(user)

  let wishlist: Wishlist = { products: [] }
  if (user) {
    wishlist = await getUserWishlists({ countryCode: locale })
  }

  const regions = await listRegions()
  const wishlistCount = wishlist?.products.length || 0

  const { categories, parentCategories } = (await listCategories({
    query: { include_ancestors_tree: true },
  })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }

  return (
    <header data-testid="header" className="tese-header sticky top-0 z-40 bg-white">
      <PriceTicker />

      <div className="border-b border-neutral-200">
        <div className="tese-container flex items-center justify-between gap-4 lg:gap-6 py-3.5">
          <div className="flex items-center gap-3 shrink-0 min-w-fit">
            <MobileNavbar
              parentCategories={parentCategories}
              categories={categories}
            />
            <TeseLogo variant="dark" />
          </div>

          <Suspense fallback={null}>
            <HeaderSearchNav variant="metalbook" />
          </Suspense>

          <HeaderToolbar
            regions={regions}
            isLoggedIn={isLoggedIn}
            wishlistCount={wishlistCount}
          />
        </div>

        <Suspense fallback={null}>
          <HeaderSearchNav variant="metalbook" layout="mobile" />
        </Suspense>
      </div>

      <div className="hidden lg:block border-b border-neutral-200 bg-white relative z-40">
        <div className="tese-container py-0 min-h-[3rem] flex items-center">
          <Suspense fallback={null}>
            <HeaderMainNav parentCategories={parentCategories} />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
