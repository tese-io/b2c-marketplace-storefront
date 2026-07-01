import { LoginForm } from '@/components/molecules/LoginForm/LoginForm'
import { UserMessagesSection } from '@/components/sections/UserMessagesSection/UserMessagesSection'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'

export default async function MessagesPage () {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  return (
    <WorkspaceAccountPage title="Messages" className="tese-sourcing-account--wide">
      <UserMessagesSection />
    </WorkspaceAccountPage>
  )
}
