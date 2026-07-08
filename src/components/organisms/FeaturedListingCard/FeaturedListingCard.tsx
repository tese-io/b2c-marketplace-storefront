import Image from 'next/image'

import { CardWishlistButton } from '@/components/cells/CardWishlistButton/CardWishlistButton'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { getCategoryVisual } from '@/components/organisms/CategoryCardB2B/category-visuals'
import { getProductPrice } from '@/lib/helpers/get-product-price'
import { SellerProps } from '@/types/seller'
import { HttpTypes } from '@medusajs/types'

type FeaturedProduct = HttpTypes.StoreProduct & { seller?: SellerProps }

function parseCertifications(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((v) => String(v).trim()).filter(Boolean)
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }
  return []
}

export function FeaturedListingCard({
  product,
  index = 0,
  sectorLabels,
  displayTitle,
  vendorCount,
  isLoggedIn,
  initiallyWishlisted = false,
}: {
  product: FeaturedProduct
  index?: number
  sectorLabels?: string[]
  displayTitle?: string
  vendorCount?: number
  /** undefined = wishlist state unknown for this surface → heart hidden */
  isLoggedIn?: boolean
  initiallyWishlisted?: boolean
}) {
  const { cheapestPrice } = getProductPrice({ product })
  const meta = product.metadata as Record<string, unknown> | undefined
  const catalogHandle = meta?.catalog_handle ? String(meta.catalog_handle) : null
  const productHref = catalogHandle
    ? `/products/${catalogHandle}`
    : `/products/${product.handle}`
  const title = displayTitle || product.title
  const category = product.categories?.[0]
  const sellerName = product.seller?.name
  const isSellerVerified = Boolean(
    (product.seller as (SellerProps & { is_verified?: boolean }) | undefined)
      ?.is_verified
  )
  const origin = meta?.origin ? String(meta.origin) : null
  const moq = meta?.moq ? String(meta.moq) : null
  const unit = meta?.unit ? String(meta.unit) : null
  const leadTime = meta?.lead_time_days
    ? `${String(meta.lead_time_days)}d lead`
    : null
  const certifications = parseCertifications(meta?.certifications)
  const accent = category?.handle
    ? getCategoryVisual(category.handle).accent
    : undefined

  const priceLabel = cheapestPrice?.calculated_price
    ? `from ${cheapestPrice.calculated_price}${unit ? ` / ${unit}` : ''}`
    : 'Request quote'

  return (
    <LocalizedClientLink
      href={productHref}
      className="tese-featured-card group cursor-pointer"
      style={{ animationDelay: `${Math.min(index, 7) * 70}ms` }}
      aria-label={`View ${title}`}
    >
      <div className="tese-featured-card-media">
        {category?.name && (
          <span className="tese-featured-card-category">{category.name}</span>
        )}
        {vendorCount && vendorCount > 1 && (
          <span
            className={
              isLoggedIn !== undefined
                ? 'tese-featured-card-vendors tese-featured-card-vendors-offset'
                : 'tese-featured-card-vendors'
            }
          >
            {vendorCount} vendors
          </span>
        )}
        {isLoggedIn !== undefined && (
          <CardWishlistButton
            productId={product.id}
            isLoggedIn={isLoggedIn}
            initiallyWishlisted={initiallyWishlisted}
          />
        )}
        {product.thumbnail ? (
          <Image
            src={decodeURIComponent(product.thumbnail)}
            alt={product.title || 'Product'}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="tese-featured-card-image object-cover"
          />
        ) : (
          <Image
            src="/images/placeholder.svg"
            alt=""
            fill
            className="tese-featured-card-image object-cover opacity-40"
          />
        )}
        {certifications.length > 0 && (
          <span
            className="tese-featured-card-cert"
            title={certifications.join(', ')}
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path
                d="M8 1.5l4.8 1.8v3.6c0 3-2 5.6-4.8 6.9-2.8-1.3-4.8-3.9-4.8-6.9V3.3L8 1.5z"
                strokeLinejoin="round"
              />
              <path d="M5.8 8l1.6 1.6 2.8-3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Certified
            {certifications.length > 1 && ` ×${certifications.length}`}
          </span>
        )}
        {accent && (
          <span
            className="tese-featured-card-accent"
            style={{ background: accent }}
            aria-hidden
          />
        )}
      </div>

      <div className="tese-featured-card-body">
        <h3 className="tese-featured-card-title">{title}</h3>

        {sectorLabels && sectorLabels.length > 0 && (
          <div className="tese-featured-card-sectors">
            {sectorLabels.slice(0, 2).map((label) => (
              <span key={label} className="tese-featured-card-sector">
                {label}
              </span>
            ))}
            {sectorLabels.length > 2 && (
              <span className="tese-featured-card-sector">
                +{sectorLabels.length - 2}
              </span>
            )}
          </div>
        )}

        {(sellerName || origin) && (
          <p className="tese-featured-card-supplier">
            {isSellerVerified && (
              <span
                className="tese-featured-card-verified"
                title="tese Verified supplier"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8 1l1.9 1.4 2.35-.15.85 2.2 2 1.25-.6 2.3.6 2.3-2 1.25-.85 2.2-2.35-.15L8 15l-1.9-1.4-2.35.15-.85-2.2-2-1.25.6-2.3-.6-2.3 2-1.25.85-2.2 2.35.15L8 1z" />
                  <path
                    d="M5.6 8.2l1.6 1.6 3.2-3.4"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="sr-only">tese Verified supplier</span>
              </span>
            )}
            {sellerName}
            {sellerName && origin && (
              <span className="tese-featured-card-dot" aria-hidden>·</span>
            )}
            {origin && <span className="tese-featured-card-origin">{origin}</span>}
          </p>
        )}

        <div className="tese-featured-card-meta">
          {moq && (
            <span className="tese-featured-card-badge">MOQ {moq}</span>
          )}
          {leadTime && (
            <span className="tese-featured-card-badge tese-featured-card-badge-muted">
              {leadTime}
            </span>
          )}
        </div>

        <div className="tese-featured-card-footer">
          <p className="tese-featured-card-price">{priceLabel}</p>
          <span className="tese-featured-card-cta">
            View &amp; quote
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
