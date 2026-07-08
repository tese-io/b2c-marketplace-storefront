import { StarRating } from '@/components/atoms'
import { SellerAvatar } from '@/components/cells/SellerAvatar/SellerAvatar'
import { TRUST_PROGRAM_NAME } from '@/data/explorer-copy'
import { SellerOrbitProfile } from '@/lib/data/seller-orbit'
import { getSellerTrustStage } from '@/lib/helpers/trust-labels'
import { SellerProps } from '@/types/seller'
import { HttpTypes } from '@medusajs/types'
import { format } from 'date-fns'
import { SellerHeroActions } from './SellerHeroActions'

function stripHtml (html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export const SellerPageHeader = ({
  seller,
  user,
  orbit,
}: {
  seller: SellerProps
  user: HttpTypes.StoreCustomer | null
  orbit?: SellerOrbitProfile | null
}) => {
  const reviews = seller.reviews?.filter((rev) => rev !== null) || []
  const reviewCount = reviews.length
  const rating =
    reviewCount > 0
      ? reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / reviewCount
      : 0

  const descriptionText = seller.description
    ? stripHtml(String(seller.description))
    : ''

  const orbitUrl = orbit?.available ? orbit.url : null
  const industry = orbit?.organization?.industry
  const trust = getSellerTrustStage(seller)

  return (
    <header className="tese-seller-hero-card">
      <div className="tese-seller-hero-grid">
        <div className="tese-seller-hero-main">
          <div className="tese-seller-avatar-ring">
            <SellerAvatar
              photo={seller.photo}
              size={88}
              alt={seller.name}
              variant="hero"
            />
          </div>
          <div className="tese-seller-hero-content">
            <p className="tese-seller-eyebrow">
              <span className="tese-seller-eyebrow-dot" aria-hidden />
              Marketplace supplier
            </p>
            <h1 className="tese-seller-name">{seller.name}</h1>
            <div className="tese-seller-badges">
              <span
                className="tese-seller-badge tese-seller-badge-primary"
                title={trust.description}
              >
                {trust.shortLabel}
              </span>
              {industry && (
                <span className="tese-seller-badge">{industry}</span>
              )}
              {orbitUrl && (
                <span className="tese-seller-badge tese-seller-badge-orbit">
                  {TRUST_PROGRAM_NAME} on Orbit
                </span>
              )}
            </div>
            <div className="tese-seller-stats">
              <span className="tese-seller-stat">
                <StarRating starSize={14} rate={rating || 0} />
                <span>{rating ? rating.toFixed(1) : 'New'}</span>
              </span>
              <span className="tese-seller-stat">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
              <span className="tese-seller-stat">
                Joined {format(seller.created_at, 'MMM yyyy')}
              </span>
            </div>
            {descriptionText ? (
              <p className="tese-seller-description">{descriptionText}</p>
            ) : (
              <p className="tese-seller-description tese-seller-description-muted">
                Sustainable materials and services supplier on the Tese B2B
                marketplace. Browse listings below or connect directly.
              </p>
            )}
          </div>
        </div>
        <SellerHeroActions
          seller={seller}
          user={user}
          orbitUrl={orbitUrl}
        />
      </div>
    </header>
  )
}
