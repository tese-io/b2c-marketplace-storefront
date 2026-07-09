import { HOME_PARTNERS } from '@/data/homepage'
import { listCertifications } from '@/lib/data/certifications'

// Guard against the catalogue growing unbounded into the homepage strip.
const MAX_BADGES = 60

export async function HomePartners() {
  const certifications = await listCertifications()

  const badges = certifications.length
    ? certifications
        .slice(0, MAX_BADGES)
        .map((certification) => ({ id: certification.slug, label: certification.name }))
    : HOME_PARTNERS

  return (
    <section className="tese-partners-section" aria-labelledby="home-partners-heading">
      <div className="tese-container">
        <h2 id="home-partners-heading" className="tese-partners-heading">
          Certifications &amp; standards we support
        </h2>
        <div className="tese-partners-strip">
          {badges.map((badge) => (
            <span key={badge.id} className="tese-partner-badge">
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
