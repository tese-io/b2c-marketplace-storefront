'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { HeartFilledIcon, HeartIcon } from '@/icons'
import { addWishlistItem, removeWishlistItem } from '@/lib/data/wishlist'
import { toast } from '@/lib/helpers/toast'

/**
 * Compact wishlist toggle for product cards. Rendered inside the card link,
 * so it must swallow the click. Logged-out users are sent to login.
 */
export const CardWishlistButton = ({
  productId,
  isLoggedIn,
  initiallyWishlisted = false,
}: {
  productId: string
  isLoggedIn: boolean
  initiallyWishlisted?: boolean
}) => {
  const [wishlisted, setWishlisted] = useState(initiallyWishlisted)
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const { locale } = useParams()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      router.push(`/${locale}/login`)
      return
    }
    if (busy) return

    const next = !wishlisted
    setBusy(true)
    setWishlisted(next)
    try {
      if (next) {
        await addWishlistItem({ reference_id: productId, reference: 'product' })
      } else {
        await removeWishlistItem({ product_id: productId })
      }
    } catch (error) {
      setWishlisted(!next)
      toast.error({
        title: 'Wishlist update failed',
        description:
          error instanceof Error ? error.message : 'An error occurred',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="tese-featured-card-wish"
      onClick={handleClick}
      disabled={busy}
      aria-pressed={wishlisted}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      data-testid="card-wishlist-button"
    >
      {wishlisted ? <HeartFilledIcon size={18} /> : <HeartIcon size={18} />}
    </button>
  )
}
