import { retrieveCustomer } from '@/lib/data/customer'
import { getUserWishlists } from '@/lib/data/wishlist'

export type WishlistState = {
  isLoggedIn: boolean
  wishlistedIds: Set<string>
}

/**
 * Fetches the current customer's wishlist state once per page (server
 * components only) so product grids can render wishlist hearts without
 * per-card requests.
 */
export async function getWishlistState(
  countryCode?: string
): Promise<WishlistState> {
  const user = await retrieveCustomer().catch(() => null)
  if (!user) {
    return { isLoggedIn: false, wishlistedIds: new Set() }
  }

  const wishlist = await getUserWishlists({ countryCode }).catch(() => ({
    products: [],
  }))

  return {
    isLoggedIn: true,
    wishlistedIds: new Set((wishlist.products || []).map((p) => p.id)),
  }
}
