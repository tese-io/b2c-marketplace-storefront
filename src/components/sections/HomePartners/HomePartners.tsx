import { HOME_PARTNERS } from '@/data/homepage'

export function HomePartners() {
  return (
    <section className="tese-partners-section" aria-labelledby="home-partners-heading">
      <div className="tese-container">
        <h2 id="home-partners-heading" className="tese-partners-heading">
          Certifications &amp; standards we support
        </h2>
        <div className="tese-partners-strip">
          {HOME_PARTNERS.map((partner) => (
            <span key={partner.id} className="tese-partner-badge">
              {partner.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
