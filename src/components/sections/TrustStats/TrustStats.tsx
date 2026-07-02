import { TRUST_STATS_COPY } from '@/data/explorer-copy'

const TRUST_STAT_ICONS = {
  certifications: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3h8l4 4v14H4V3h4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M16 3v4h4M8 13l2.5 2.5L14 11"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="17"
        cy="17"
        r="3.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M16.2 17l.75.75 1.55-1.55"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  circularity: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4.5c-3.5 0-6.5 2.4-7.3 5.7M4.7 10.2l2.1 1.2M12 19.5c3.5 0 6.5-2.4 7.3-5.7M19.3 13.8l-2.1-1.2M12 8v4l2.5 1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 7.8L5.8 5.5M16.5 7.8l1.7-2.3M7.5 16.2l-1.7 2.3M16.5 16.2l1.7 2.3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  ),
  fulfilment: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="8.25"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M3.75 12h16.5M12 3.75c2.2 2.5 3.4 5.2 3.4 8.25S14.2 17.75 12 20.25M12 3.75C9.8 6.25 8.6 9 8.6 12.25s1.2 5.25 3.4 7.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M16.5 9.5l2-1.5M16.5 14.5l2 1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  discovery: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="18" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="17" r="2.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M7.8 9.4L10.4 14.8M16.2 9.4l-2.6 5.4M8.25 8h7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12 4.5v1.5M12 4.5l1.2.7M12 4.5l-1.2.7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
} as const

export function TrustStats () {
  return (
    <section
      className="tese-trust-stats"
      aria-labelledby="trust-stats-heading"
    >
      <div className="tese-container tese-trust-stats-inner">
        <header className="tese-trust-stats-header">
          <p className="tese-trust-stats-eyebrow">
            <span className="tese-trust-stats-eyebrow-dot" aria-hidden />
            {TRUST_STATS_COPY.eyebrow}
          </p>
          <h2 id="trust-stats-heading" className="tese-trust-stats-heading">
            {TRUST_STATS_COPY.heading}
          </h2>
        </header>

        <div className="tese-trust-stats-panel tese-grain">
          <div className="tese-trust-stats-grid">
            {TRUST_STATS_COPY.items.map((stat, index) => (
              <article
                key={stat.id}
                className="tese-trust-stat"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="tese-trust-stat-index" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="tese-trust-stat-icon" aria-hidden>
                  {TRUST_STAT_ICONS[stat.id]}
                </div>
                <div className="tese-trust-stat-copy">
                  <h3 className="tese-trust-stat-value">{stat.value}</h3>
                  <p className="tese-trust-stat-label">{stat.label}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
