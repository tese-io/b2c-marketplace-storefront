import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { HOME_SECONDARY_CTA } from '@/data/homepage'

export function HomeSecondaryCTA() {
  const cta = HOME_SECONDARY_CTA

  return (
    <section className="tese-secondary-cta-section" aria-labelledby="home-secondary-cta-heading">
      <div className="tese-container">
        <div className="tese-secondary-cta">
          <div className="tese-secondary-cta-copy">
            <p className="tese-secondary-cta-eyebrow">{cta.eyebrow}</p>
            <h2 id="home-secondary-cta-heading" className="tese-secondary-cta-heading">
              {cta.heading}
            </h2>
            <p className="tese-secondary-cta-desc">{cta.description}</p>
          </div>
          <div className="tese-secondary-cta-actions">
            <LocalizedClientLink
              href={cta.primaryHref}
              className="tese-secondary-cta-btn tese-secondary-cta-btn-outline"
            >
              {cta.primaryLabel}
            </LocalizedClientLink>
            <LocalizedClientLink
              href={cta.secondaryHref}
              className="tese-secondary-cta-btn tese-cta"
            >
              {cta.secondaryLabel}
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
