import Image from 'next/image'
import { HttpTypes } from '@medusajs/types'

import { CartDropdown, MobileNavbar, Navbar } from '@/components/cells'
import { HeartIcon } from '@/icons'
import { UserDropdown } from '@/components/cells/UserDropdown/UserDropdown'
import { Wishlist } from '@/types/wishlist'
import { Badge } from '@/components/atoms'
import CountrySelector from '@/components/molecules/CountrySelector/CountrySelector'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { MessageButton } from '@/components/molecules/MessageButton/MessageButton'
import { listCategories } from '@/lib/data/categories'
import { listRegions } from '@/lib/data/regions'
import { getUserWishlists } from '@/lib/data/wishlist'
import { retrieveCustomer } from '@/lib/data/customer'

const HEADER_NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Vendors', href: '/sellers' },
  { label: 'Categories', href: '/categories' },
  { label: 'RFQ', href: '/rfq' },
]

function HeaderSeparator () {
  return (
    <div
      className="hidden lg:block w-px h-5 bg-border-primary flex-shrink-0"
      aria-hidden
    />
  )
}

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
    query: { include_ancestors_tree: true }
  })) as {
    categories: HttpTypes.StoreProductCategory[]
    parentCategories: HttpTypes.StoreProductCategory[]
  }

  const vendorUrl =
    process.env.NEXT_PUBLIC_VENDOR_URL || 'https://vendor.mercurjs.com'

  return (
    <header data-testid="header" className="bg-primary border-b border-border-primary">
      <div
        className="flex items-center gap-4 lg:gap-6 py-3 lg:py-4 lg:px-8 px-4 md:px-5"
        data-testid="header-top"
      >
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-4 min-w-0">
          <MobileNavbar
            parentCategories={parentCategories}
            categories={categories}
          />
          <LocalizedClientLink
            href="/"
            className="flex items-center flex-shrink-0"
            data-testid="header-logo-link"
          >
            <Image
              src="/logo.png"
              width={120}
              height={32}
              alt="tese.io – Sustainability Marketplace"
              priority
              className="h-8 w-auto"
            />
          </LocalizedClientLink>
        </div>

        <HeaderSeparator />

        {/* Center: main nav */}
        <nav
          className="hidden lg:flex items-center gap-6 flex-1"
          aria-label="Main navigation"
        >
          {HEADER_NAV_LINKS.map(({ label, href }) => (
            <LocalizedClientLink
              key={label}
              href={href}
              className="text-sm font-medium text-primary hover:text-action transition-colors uppercase tracking-wide"
            >
              {label}
            </LocalizedClientLink>
          ))}
        </nav>

        <HeaderSeparator />

        {/* Right: actions + CTA */}
        <div
          className="flex items-center justify-end gap-2 lg:gap-4 flex-shrink-0"
          data-testid="header-actions"
        >
          <CountrySelector regions={regions} />
          {isLoggedIn && <MessageButton />}
          <UserDropdown isLoggedIn={isLoggedIn} />
          {isLoggedIn && (
            <LocalizedClientLink
              href="/user/wishlist"
              className="relative p-1 rounded hover:bg-component-secondary-hover transition-colors"
              data-testid="header-wishlist-link"
              aria-label="Wishlist"
            >
              <HeartIcon size={20} />
              {Boolean(wishlistCount) && (
                <Badge
                  className="absolute -top-1 -right-1 min-w-4 h-4 p-0 flex items-center justify-center text-[10px]"
                  data-testid="wishlist-count-badge"
                >
                  {wishlistCount}
                </Badge>
              )}
            </LocalizedClientLink>
          )}
          <CartDropdown />

          <a
            href={vendorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold uppercase tracking-wide border-2 border-primary text-primary hover:bg-action hover:text-tertiary hover:border-action transition-colors rounded-sm whitespace-nowrap"
          >
            Sell as vendor
          </a>
        </div>
      </div>

      <Navbar categories={categories} parentCategories={parentCategories} />
    </header>
  )
}
