import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { HOME_INSIGHTS } from '@/data/homepage'

export function HomeInsights() {
  return (
    <section className="tese-insights-section" aria-labelledby="home-insights-heading">
      <div className="tese-featured-section-header">
        <div>
          <p className="tese-featured-eyebrow">
            <span className="tese-featured-eyebrow-dot" aria-hidden />
            Knowledge hub
          </p>
          <h2 id="home-insights-heading" className="tese-featured-heading">
            Recent articles &amp; insights
          </h2>
          <p className="tese-featured-subtitle">
            Guides on sustainable procurement, certification verification, and sector benchmarks.
          </p>
        </div>
      </div>

      <div className="tese-insights-grid">
        {HOME_INSIGHTS.map((insight, index) => (
          <LocalizedClientLink
            key={insight.id}
            href={insight.href}
            className="tese-insight-card group"
            style={{
              animationDelay: `${index * 70}ms`,
              ['--insight-accent' as string]: insight.accent,
            }}
          >
            <div className="tese-insight-card-visual" aria-hidden />
            <div className="tese-insight-card-body">
              <span className="tese-insight-card-category">{insight.category}</span>
              <h3 className="tese-insight-card-title">{insight.title}</h3>
              <p className="tese-insight-card-excerpt">{insight.excerpt}</p>
              <span className="tese-insight-card-link">Read more →</span>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
