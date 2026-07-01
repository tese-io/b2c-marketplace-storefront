import { HOME_PARTNER_STATS } from '@/data/homepage'

export function HomePartnerStats() {
  return (
    <section className="tese-partner-stats-band" aria-label="Platform statistics">
      <div className="tese-container">
        <div className="tese-partner-stats-inner">
          <p className="tese-partner-stats-eyebrow">Partner with tese.io to enjoy</p>
          <div className="tese-partner-stats-grid">
            {HOME_PARTNER_STATS.map((stat) => (
              <div key={stat.label} className="tese-partner-stat">
                <p className="tese-partner-stat-value">{stat.value}</p>
                <p className="tese-partner-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
