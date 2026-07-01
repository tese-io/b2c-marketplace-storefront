import { OrderReturnSection } from '@/components/sections/OrderReturnSection/OrderReturnSection'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import {
  retrieveOrder,
  retrieveReturnReasons,
  retriveReturnMethods,
} from '@/lib/data/orders'

export default async function ReturnOrderPage ({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const order = (await retrieveOrder(id)) as any
  const returnReasons = await retrieveReturnReasons()
  const returnMethods = await retriveReturnMethods(id)

  return (
    <WorkspaceAccountPage>
      <OrderReturnSection
        order={order}
        returnReasons={returnReasons}
        shippingMethods={returnMethods as any}
      />
    </WorkspaceAccountPage>
  )
}
