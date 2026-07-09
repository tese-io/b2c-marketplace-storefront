import Image from 'next/image'

import { HOME_PARTNERS } from '@/data/homepage'
import { listCertifications } from '@/lib/data/certifications'

// Guard against the catalogue growing unbounded into the homepage strip.
const MAX_BADGES = 60

type Badge = { id: string; label: string; logoUrl?: string | null }

function isSvg(url: string) {
  return url.split(/[?#]/)[0].toLowerCase().endsWith('.svg')
}

/**
 * next/image will not optimise SVG unless `dangerouslyAllowSVG` is set, and this
 * app's `remotePatterns` allows any host — so enabling it would let arbitrary
 * remote SVG be re-served from our own origin. Serve SVG through a plain <img>
 * instead (scripts in an SVG never execute in an <img> context) and reserve the
 * optimiser for the raster logos, which are the heavy ones.
 */
// The badge already renders the certification name as text, so the logo is
// decorative — alt="" keeps screen readers from announcing it twice.
function CertificationLogo({ src }: { src: string }) {
  if (isSvg(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="tese-partner-logo"
      />
    )
  }

  return (
    <Image
      src={src}
      alt=""
      width={96}
      height={24}
      loading="lazy"
      className="tese-partner-logo"
    />
  )
}

export async function HomePartners() {
  const certifications = await listCertifications()

  const badges: Badge[] = certifications.length
    ? certifications.slice(0, MAX_BADGES).map((certification) => ({
        id: certification.slug,
        label: certification.name,
        logoUrl: certification.logoUrl,
      }))
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
              {badge.logoUrl ? (
                <CertificationLogo src={badge.logoUrl} />
              ) : null}
              {badge.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
