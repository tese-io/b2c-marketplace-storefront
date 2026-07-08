import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

import { SOURCING_LEGAL_LINKS } from './constants'

export function SourcingLegalNotice () {
  const terms = SOURCING_LEGAL_LINKS.find((link) => link.id === 'terms')
  const privacy = SOURCING_LEGAL_LINKS.find((link) => link.id === 'privacy')

  if (!terms || !privacy) return null

  return (
    <p className="tese-sourcing-legal-notice">
      By messaging AI Sourcing, you agree to our{' '}
      <LocalizedClientLink href={terms.href} className="tese-sourcing-legal-link">
        Terms
      </LocalizedClientLink>{' '}
      and have read our{' '}
      <LocalizedClientLink href={privacy.href} className="tese-sourcing-legal-link">
        Privacy Policy
      </LocalizedClientLink>
      .
    </p>
  )
}
