import { TeseLogo } from "@/components/atoms/TeseLogo/TeseLogo"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import footerLinks from "@/data/footerLinks"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants/brand"

export function Footer() {
  return (
    <footer className="tese-ink-surface text-white" data-testid="footer">
      <div className="tese-container py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <TeseLogo variant="light" className="mb-4" />
          <p className="text-sm text-white/60 leading-relaxed">
            {SITE_DESCRIPTION} Personalise by sector in the header to focus on
            the materials that matter for your sustainability programme.
          </p>
          <LocalizedClientLink
            href="/sourcing"
            className="inline-flex mt-4 tese-cta rounded-full px-4 py-2 text-[13px] font-semibold"
          >
            Open AI Sourcing →
          </LocalizedClientLink>
        </div>

        <div data-testid="footer-customer-services">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/90">
            Buyer services
          </h2>
          <nav className="space-y-2" aria-label="Customer services navigation">
            {footerLinks.customerServices.map(({ label, path }) => (
              <LocalizedClientLink
                key={label}
                href={path}
                className="block text-sm text-white/60 hover:text-tese-lime transition"
                data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {label}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        <div data-testid="footer-about">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/90">
            Company
          </h2>
          <nav className="space-y-2" aria-label="About navigation">
            {footerLinks.about.map(({ label, path }) => (
              <LocalizedClientLink
                key={label}
                href={path}
                className="block text-sm text-white/60 hover:text-tese-lime transition"
                data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {label}
              </LocalizedClientLink>
            ))}
          </nav>
        </div>

        <div data-testid="footer-connect">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/90">
            Connect
          </h2>
          <nav className="space-y-2" aria-label="Social media navigation">
            {footerLinks.connect.map(({ label, path }) => (
              <a
                aria-label={`Go to ${label} page`}
                title={`Go to ${label} page`}
                key={label}
                href={path}
                className="block text-sm text-white/60 hover:text-tese-lime transition"
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`footer-link-${label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10 py-6" data-testid="footer-copyright">
        <p className="text-sm text-white/50 text-center">
          © {new Date().getFullYear()} {SITE_NAME} — Sustainability-focused marketplace
        </p>
      </div>
    </footer>
  )
}
