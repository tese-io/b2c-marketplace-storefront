import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ConnectOnOrbitButton } from '@/components/molecules/ConnectOnOrbitButton/ConnectOnOrbitButton'

type SellerProductsEmptyProps = {
  sellerName?: string
  orbitUrl?: string | null
}

function EmptyIcon () {
  return (
    <svg
      className="tese-seller-empty-icon"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <rect
        x="8"
        y="14"
        width="32"
        height="24"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 20h32M16 14V10a4 4 0 014-4h8a4 4 0 014 4v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="28" r="3" fill="currentColor" opacity="0.35" />
    </svg>
  )
}

export function SellerProductsEmpty ({
  sellerName,
  orbitUrl
}: SellerProductsEmptyProps) {
  const label = sellerName ? `${sellerName} hasn't` : "This supplier hasn't"

  return (
    <div className="tese-seller-empty" data-testid="seller-products-empty">
      <div className="tese-seller-empty-visual">
        <EmptyIcon />
      </div>
      <p className="tese-seller-empty-eyebrow">No listings</p>
      <h2 className="tese-seller-empty-title">Nothing listed yet</h2>
      <p className="tese-seller-empty-hint">
        {label} published products on the marketplace yet. Browse categories
        {orbitUrl ? ' or connect on Orbit' : ''} to learn more about this
        supplier.
      </p>
      <div className="tese-seller-empty-actions">
        <LocalizedClientLink href="/categories" className="tese-seller-empty-link">
          Browse categories
        </LocalizedClientLink>
        <ConnectOnOrbitButton url={orbitUrl} />
        <LocalizedClientLink href="/sourcing" className="tese-seller-empty-link tese-seller-empty-link-muted">
          Try AI sourcing
        </LocalizedClientLink>
      </div>
    </div>
  )
}
