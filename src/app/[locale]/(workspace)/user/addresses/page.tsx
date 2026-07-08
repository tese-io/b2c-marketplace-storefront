import { redirect } from 'next/navigation'

import { Addresses } from '@/components/organisms'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'
import { listRegions } from '@/lib/data/regions'

export default async function AddressesPage () {
  const user = await retrieveCustomer()
  const regions = await listRegions()

  if (!user) {
    redirect('/login')
  }

  return (
    <WorkspaceAccountPage
      title="Addresses"
      lead="Save delivery addresses for faster checkout and accurate order updates."
      testId="addresses-page"
    >
      <Addresses {...{ user, regions }} />
    </WorkspaceAccountPage>
  )
}
