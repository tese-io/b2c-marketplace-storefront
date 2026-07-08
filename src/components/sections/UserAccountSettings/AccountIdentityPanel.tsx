import { HttpTypes } from '@medusajs/types'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { getManageAccountUrl } from '@/lib/helpers/tese-auth-urls'

type AccountIdentityPanelProps = {
  user: HttpTypes.StoreCustomer
}

function IdentityField ({
  label,
  value,
  testId,
}: {
  label: string
  value: string
  testId?: string
}) {
  return (
    <div className="tese-account-identity-field" data-testid={testId}>
      <p className="tese-user-dashboard-account-label">{label}</p>
      <p className="tese-account-identity-value">{value || '—'}</p>
    </div>
  )
}

export function AccountIdentityPanel ({ user }: AccountIdentityPanelProps) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')
  const manageAccountUrl = getManageAccountUrl()

  return (
    <div className="tese-sourcing-account-body" data-testid="profile-settings-container">
      <section className="tese-account-identity-card">
        <div className="tese-account-identity-fields">
          <IdentityField
            label="Name"
            value={fullName}
            testId="profile-name-value"
          />
          <IdentityField
            label="Email"
            value={user.email || ''}
            testId="profile-email-value"
          />
          <IdentityField
            label="Phone number"
            value={user.phone || ''}
            testId="profile-phone-value"
          />
        </div>
        <p className="tese-account-identity-note">
          Your name, email, and password are managed by your tese.io account.
        </p>
      </section>

      <div className="tese-account-identity-actions">
        <a
          href={manageAccountUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tese-sourcing-placeholder-cta"
          data-testid="manage-account-on-tese"
        >
          Manage account on tese.io
        </a>
        <LocalizedClientLink
          href="/user/addresses"
          className="tese-user-dashboard-account-link"
          data-testid="settings-shipping-addresses-link"
        >
          Shipping addresses
        </LocalizedClientLink>
      </div>
    </div>
  )
}
