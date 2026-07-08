import { redirect } from 'next/navigation'

import { AccountIdentityPanel } from '@/components/sections/UserAccountSettings/AccountIdentityPanel'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'

export default async function SettingsPage () {
  const user = await retrieveCustomer()

  if (!user) {
    redirect('/login')
  }

  return (
    <WorkspaceAccountPage
      title="Settings"
      lead="Marketplace preferences and links to your tese.io account."
      testId="profile-settings-page"
    >
      <AccountIdentityPanel user={user} />
    </WorkspaceAccountPage>
  )
}
