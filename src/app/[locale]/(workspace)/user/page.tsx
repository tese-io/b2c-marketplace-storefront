import { redirect } from 'next/navigation'

import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'

export default async function UserPage () {
  const user = await retrieveCustomer()

  if (!user) {
    redirect('/login')
  }

  return (
    <WorkspaceAccountPage title={`Welcome, ${user.first_name}`}>
      <p className="tese-sourcing-account-lead">
        Your account is ready. Start a new AI search or browse the catalogue.
      </p>
    </WorkspaceAccountPage>
  )
}
