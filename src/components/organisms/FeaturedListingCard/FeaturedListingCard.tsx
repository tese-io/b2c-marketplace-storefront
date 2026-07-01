import Image from 'next/image'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { getProductPrice } from '@/lib/helpers/get-product-price'
import { SellerProps } from '@/types/seller'
import { HttpTypes } from '@medusajs/types'

type FeaturedProduct = HttpTypes.StoreProduct & { seller?: SellerProps }

export function FeaturedListingCard({
  product,
  index = 0,
  sectorLabels,
  displayTitle,
  vendorCount,
}: {
  product: FeaturedProduct
  index?: number
  sectorLabels?: string[]
  displayTitle?: string
  vendorCount?: number
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
  const origin = meta?.origin ? String(meta.origin) : null
  const moq = meta?.moq ? String(meta.moq) : null
  const unit = meta?.unit ? String(meta.unit) : null
  const leadTime = meta?.lead_time_days
    ? `${String(meta.lead_time_days)}d lead`
    : null

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
          <span className="tese-featured-card-vendors">{vendorCount} vendors</span>
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
