import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

import { SOURCING_LEGAL_LINKS } from './constants'

export function SourcingPageFooter () {
  const year = new Date().getFullYear()

  return (
    <footer className="tese-sourcing-page-footer" aria-label="Legal and resources">
      <nav className="tese-sourcing-page-footer-nav" aria-label="Legal links">
        {SOURCING_LEGAL_LINKS.map((link) => (
          <LocalizedClientLink
            key={link.id}
            href={link.href}
            className="tese-sourcing-page-footer-link"
          >
            {link.label}
          </LocalizedClientLink>
        ))}
      </nav>
      <p className="tese-sourcing-page-footer-copy">
        © {year} tese.io
      </p>
    </footer>
  )
}
