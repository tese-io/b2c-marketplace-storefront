'use client'

import type { ReactNode } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import type { InquiryPill, InquiryProductSummary } from '@/lib/helpers/inquiry-product'

function PillRow ({ pills }: { pills: InquiryPill[] }) {
  if (!pills.length) return null
  return (
    <div className="tese-inquiry-product-pills">
      {pills.map(({ label, value }) => (
        <span key={`${label}-${value}`} className="tese-inquiry-product-pill">
          <span className="tese-inquiry-product-pill-label">{label}:</span>{' '}
          {value}
        </span>
      ))}
    </div>
  )
}

export function InquiryProductStrip ({
  product,
  loading,
  productMetaPills,
  requirementPills,
  statusBadge,
  productHref,
}: {
  product: InquiryProductSummary | null
  loading: boolean
  productMetaPills: InquiryPill[]
  requirementPills: InquiryPill[]
  statusBadge: ReactNode
  productHref: string
}) {
  const title = product?.title || 'Product'

  return (
    <div className="tese-inquiry-product-strip">
      <div className="tese-inquiry-product-strip-main">
        <div className="tese-inquiry-product-media" aria-hidden={loading}>
          {loading ? (
            <div className="tese-inquiry-product-skeleton" />
          ) : product?.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={title}
              className="tese-inquiry-product-image"
              loading="lazy"
              width={96}
              height={96}
            />
          ) : (
            <div className="tese-inquiry-product-placeholder" />
          )}
        </div>

        <div className="tese-inquiry-product-body">
          <div className="tese-inquiry-product-head">
            <div className="tese-inquiry-product-copy">
              {loading ? (
                <>
                  <div className="tese-inquiry-detail-skeleton-line tese-inquiry-detail-skeleton-line--title" />
                  <div className="tese-inquiry-detail-skeleton-line tese-inquiry-detail-skeleton-line--short" />
                </>
              ) : (
                <>
                  <p className="tese-inquiry-product-title">{title}</p>
                  {product?.category ? (
                    <p className="tese-inquiry-product-category">{product.category}</p>
                  ) : null}
                  {product?.priceLabel ? (
                    <p className="tese-inquiry-product-price">{product.priceLabel}</p>
                  ) : null}
                </>
              )}
            </div>
            {statusBadge}
          </div>

          {!loading ? (
            <>
              <PillRow pills={productMetaPills} />
              <PillRow pills={requirementPills} />
              <LocalizedClientLink
                href={productHref}
                className="tese-inquiry-product-link"
              >
                View product →
              </LocalizedClientLink>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
