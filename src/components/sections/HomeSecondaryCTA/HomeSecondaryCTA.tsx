import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { HOME_SECONDARY_CTA } from '@/data/homepage'
import { getTranslations } from 'next-intl/server'

function CtaLink ({
  href,
  className,
  children,
}: {
  href: string
  className: string
  children: React.ReactNode
}) {
  if (href.startsWith('http')) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  return (
    <LocalizedClientLink href={href} className={className}>
      {children}
    </LocalizedClientLink>
  )
}

export async function HomeSecondaryCTA() {
  const t = await getTranslations("home.secondaryCta")
  const cta = HOME_SECONDARY_CTA

  return (
    <section className="tese-secondary-cta-section" aria-labelledby="home-secondary-cta-heading">
      <div className="tese-container">
        <div className="tese-secondary-cta">
          <div className="tese-secondary-cta-copy">
            <p className="tese-secondary-cta-eyebrow">{t("eyebrow")}</p>
            <h2 id="home-secondary-cta-heading" className="tese-secondary-cta-heading">
              {t("heading")}
            </h2>
            <p className="tese-secondary-cta-desc">{t("description")}</p>
          </div>
          <div className="tese-secondary-cta-actions">
            <CtaLink
              href={cta.primaryHref}
              className="tese-secondary-cta-btn tese-secondary-cta-btn-outline"
            >
              {t("primaryLabel")}
            </CtaLink>
            <CtaLink
              href={cta.secondaryHref}
              className="tese-secondary-cta-btn tese-cta"
            >
              {t("secondaryLabel")}
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  )
}
