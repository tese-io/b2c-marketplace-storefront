import { HOME_PARTNER_STATS } from '@/data/homepage'
import { getTranslations } from 'next-intl/server'

export async function HomePartnerStats() {
  const t = await getTranslations("home.stats")
  return (
    <section className="tese-partner-stats-band" aria-label="Platform statistics">
      <div className="tese-container">
        <div className="tese-partner-stats-inner">
          <p className="tese-partner-stats-eyebrow">Partner with tese.io to enjoy</p>
          <div className="tese-partner-stats-grid">
            {HOME_PARTNER_STATS.map((stat) => (
              <div key={stat.labelKey} className="tese-partner-stat">
                <p className="tese-partner-stat-value">{stat.valueKey ? t(stat.valueKey) : stat.value}</p>
                <p className="tese-partner-stat-label">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
