import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { SECTORS, type SectorId } from '@/data/sectors'
import { getSectorVisual } from '@/data/sector-visuals'
import { buildCatalogQuery } from '@/lib/helpers/sector-preferences'

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export function HomeIndustriesSection() {
  const industries = SECTORS.filter(
    (s): s is typeof SECTORS[number] & { id: Exclude<SectorId, 'all'> } =>
      s.id !== 'all'
  )

  return (
    <section className="tese-industries-section" aria-labelledby="home-industries-heading">
      <div className="tese-featured-section-header">
        <div>
          <p className="tese-featured-eyebrow">
            <span className="tese-featured-eyebrow-dot" aria-hidden />
            Sectors
          </p>
          <h2 id="home-industries-heading" className="tese-featured-heading">
            Industries we serve
          </h2>
          <p className="tese-featured-subtitle">
            Personalise your browse experience by sector — each with vetted suppliers and certification data.
          </p>
        </div>

        <div className="tese-featured-section-actions">
          <LocalizedClientLink href="/categories" className="tese-featured-view-all">
            View all sectors →
          </LocalizedClientLink>
        </div>
      </div>

      <div className="tese-industries-grid">
        {industries.map((sector, index) => {
          const visual = getSectorVisual(sector.id)
          const href = `/categories${buildCatalogQuery(sector.id)}`

          return (
            <LocalizedClientLink
              key={sector.id}
              href={href}
              className="tese-industry-card group"
              style={{
                animationDelay: `${index * 70}ms`,
                ['--sector-accent' as string]: visual.accent,
                ['--sector-accent-soft' as string]: visual.accentSoft,
                ['--sector-icon-bg' as string]: visual.iconBg,
              }}
            >
              <div className="tese-industry-card-visual">
                <div className="tese-industry-card-icon">{visual.icon}</div>
              </div>
              <div className="tese-industry-card-body">
                <h3 className="tese-industry-card-title">{sector.label}</h3>
                <p className="tese-industry-card-desc">
                  {truncate(sector.explorerIntro, 140)}
                </p>
                <span className="tese-industry-card-link">Browse sector →</span>
              </div>
            </LocalizedClientLink>
          )
        })}
      </div>
    </section>
  )
}
