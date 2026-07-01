import { LoginForm, ProfileDetails } from '@/components/molecules'
import { ProfilePassword } from '@/components/molecules/ProfileDetails/ProfilePassword'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'

export default async function SettingsPage () {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  return (
    <WorkspaceAccountPage title="Settings" testId="profile-settings-page">
      <div className="space-y-8" data-testid="profile-settings-container">
        <ProfileDetails user={user} />
        <ProfilePassword user={user} />
      </div>
    </WorkspaceAccountPage>
  )
}
