import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { HOME_SERVICES, type HomeService } from '@/data/homepage'
import { getTranslations } from 'next-intl/server'

function ServiceIcon({ icon }: { icon: HomeService['icon'] }) {
  const stroke = {
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (icon) {
    case 'marketplace':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...stroke} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      )
    case 'sourcing':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...stroke} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      )
    case 'verification':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...stroke} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'logistics':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...stroke} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      )
    case 'finance':
      return (
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path {...stroke} d="M2.25 18.75a7.5 7.5 0 0015 0M2.25 18.75h15M2.25 18.75v-7.5a7.5 7.5 0 0115 0v7.5M12 6.75v3.75m0 0l2.25-2.25M12 10.5L9.75 8.25" />
        </svg>
      )
  }
}

export async function HomeServicesSection() {
  const t = await getTranslations("home.services")
  return (
    <section className="tese-services-section" aria-labelledby="home-services-heading">
      <div className="tese-products-section-header">
        <div className="tese-products-section-intro">
          <p className="tese-products-eyebrow">
            <span className="tese-products-eyebrow-dot" aria-hidden />
            Platform capabilities
          </p>
          <h2 id="home-services-heading" className="tese-products-heading">
            Our services
          </h2>
          <p className="tese-products-subtitle">
            End-to-end sustainable procurement — from discovery and verification to finance and fulfilment.
          </p>
        </div>

        <div className="tese-products-section-actions">
          <LocalizedClientLink href="/sourcing" className="tese-products-view-all">
            Open AI sourcing →
          </LocalizedClientLink>
        </div>
      </div>

      <div className="tese-services-grid">
        {HOME_SERVICES.map((service, index) => (
          <LocalizedClientLink
            key={service.id}
            href={service.href}
            className="tese-service-card group"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="tese-service-card-icon">
              <ServiceIcon icon={service.icon} />
            </div>
            <h3 className="tese-service-card-title">{t(`${service.key}.title`)}</h3>
            {true && (
              <p className="tese-service-card-outcome">{t(`${service.key}.outcome`)}</p>
            )}
            <p className="tese-service-card-desc">{t(`${service.key}.description`)}</p>
            <span className="tese-service-card-link">
              Learn more →
            </span>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
