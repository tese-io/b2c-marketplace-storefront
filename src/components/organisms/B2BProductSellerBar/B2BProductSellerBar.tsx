import { getSellerTrustStage } from '@/lib/helpers/trust-labels'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { SellerProps } from '@/types/seller'
import Image from 'next/image'

export function B2BProductSellerBar({ seller }: { seller?: SellerProps }) {
  if (!seller) return null

  const trust = getSellerTrustStage(seller)

  return (
    <div className="tese-pdp-seller">
      <div className="tese-pdp-seller-inner">
        <div className="tese-pdp-seller-avatar">
          {seller.photo ? (
            <Image
              src={seller.photo}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="tese-pdp-seller-initial" aria-hidden>
              {seller.name?.charAt(0) || 'S'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="tese-pdp-seller-label" title={trust.description}>
            {trust.shortLabel}
          </p>
          <p className="tese-pdp-seller-name">{seller.name}</p>
          {seller.description && (
            <p className="tese-pdp-seller-desc">{seller.description}</p>
          )}
        </div>
        {seller.handle && (
          <LocalizedClientLink
            href={`/sellers/${seller.handle}`}
            className="tese-pdp-seller-link"
          >
            View supplier
          </LocalizedClientLink>
        )}
      </div>
    </div>
  )
}
