import { LoginForm } from '@/components/molecules/LoginForm/LoginForm'
import { UserMessagesSection } from '@/components/sections/UserMessagesSection/UserMessagesSection'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'

export default async function MessagesPage () {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  return (
    <WorkspaceAccountPage className="tese-sourcing-account--wide tese-sourcing-account--messages">
      <UserMessagesSection />
    </WorkspaceAccountPage>
  )
}
