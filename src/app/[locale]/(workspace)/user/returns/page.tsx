import { OrderReturnRequests } from '@/components/sections/OrderReturnRequests/OrderReturnRequests'
import { WorkspaceAccountEmpty } from '@/components/sections/SourcingAppShell/WorkspaceAccountEmpty'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'
import { getReturns, retrieveReturnReasons } from '@/lib/data/orders'

export default async function ReturnsPage ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; return: string }>
}) {
  const { order_return_requests } = await getReturns()
  const returnReasons = await retrieveReturnReasons()

  const user = await retrieveCustomer()

  const { page, return: returnId } = await searchParams

  const sortedReturns = order_return_requests.sort(
    (a, b) =>
      new Date(b.line_items[0].created_at).getTime() -
      new Date(a.line_items[0].created_at).getTime()
  )

  return (
    <WorkspaceAccountPage title="Returns" testId="returns-page">
      {sortedReturns.length === 0 ? (
        <WorkspaceAccountEmpty
          title="No returns yet"
          description="When you request a return on an order, it will appear here."
          primaryLabel="View orders"
          primaryHref="/user/orders"
          secondaryLabel="Browse catalogue"
          secondaryHref="/categories"
          testId="returns-empty-state"
        />
      ) : (
        <OrderReturnRequests
          returns={sortedReturns}
          user={user}
          page={page}
          currentReturn={returnId || ''}
          returnReasons={returnReasons}
        />
      )}
    </WorkspaceAccountPage>
  )
}
