'use client'

import Image from 'next/image'

import type { CatalogBrand } from '@/lib/helpers/catalog-product'
import { cn } from '@/lib/utils'

export function BrandVendorPicker({
  brands,
  selectedSlug,
  onSelect,
}: {
  brands: CatalogBrand[]
  selectedSlug: string
  onSelect: (slug: string) => void
}) {
  const visible = brands.slice(0, 4)
  const overflow = brands.length - visible.length

  return (
    <div className="tese-catalog-pdp-brands">
      <p className="tese-catalog-pdp-brands-label">Brand</p>
      <div className="tese-catalog-pdp-brands-row" role="list">
        {visible.map((brand) => {
          const isActive = brand.slug === selectedSlug
          const sellerName = brand.listing.seller?.name
          return (
            <button
              key={brand.slug}
              type="button"
              role="listitem"
              onClick={() => onSelect(brand.slug)}
              className={cn(
                'tese-catalog-pdp-brand',
                isActive && 'tese-catalog-pdp-brand-active'
              )}
              aria-pressed={isActive}
              aria-label={`${brand.name} from ${sellerName || brand.name}`}
              title={sellerName ? `Supplied by ${sellerName}` : brand.name}
            >
              {brand.logo ? (
                <Image
                  src={brand.logo}
                  alt=""
                  width={72}
                  height={28}
                  className="h-7 w-auto max-w-[72px] object-contain"
                />
              ) : (
                <span className="tese-catalog-pdp-brand-inner">
                  <span className="tese-catalog-pdp-brand-text">{brand.name}</span>
                  {sellerName && sellerName !== brand.name && (
                    <span className="tese-catalog-pdp-brand-vendor">{sellerName}</span>
                  )}
                </span>
              )}
            </button>
          )
        })}
        {overflow > 0 && (
          <span className="tese-catalog-pdp-brand-more">+{overflow} more</span>
        )}
      </div>
    </div>
  )
}
