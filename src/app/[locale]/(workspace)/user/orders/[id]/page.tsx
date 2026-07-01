import { format } from 'date-fns'
import { redirect } from 'next/navigation'

import { Button } from '@/components/atoms'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { OrderDetailsSection } from '@/components/sections/OrderDetailsSection/OrderDetailsSection'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { ArrowLeftIcon } from '@/icons'
import { retrieveCustomer } from '@/lib/data/customer'
import { retrieveOrderSet } from '@/lib/data/orders'

export default async function UserOrderDetailPage ({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await retrieveCustomer()
  const orderSet = await retrieveOrderSet(id)

  if (!user) return redirect('/login')

  return (
    <WorkspaceAccountPage>
      <LocalizedClientLink href="/user/orders">
        <Button
          variant="tonal"
          className="label-md text-action-on-secondary uppercase flex items-center gap-2"
        >
          <ArrowLeftIcon className="size-4" />
          All orders
        </Button>
      </LocalizedClientLink>
      <div className="sm:flex items-center justify-between">
        <h1 className="tese-sourcing-account-title mt-6 mb-0">
          Order set #{orderSet.display_id}
        </h1>
        <p className="label-md text-secondary">
          Order date:{' '}
          <span className="text-primary">
            {format(orderSet.created_at || '', 'yyyy-MM-dd')}
          </span>
        </p>
      </div>
      <OrderDetailsSection orderSet={orderSet} />
    </WorkspaceAccountPage>
  )
}
