import { isEmpty } from 'lodash'

import { LoginForm, ParcelAccordion } from '@/components/molecules'
import { OrdersPagination } from '@/components/sections'
import { WorkspaceAccountEmpty } from '@/components/sections/SourcingAppShell/WorkspaceAccountEmpty'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'
import { listOrders } from '@/lib/data/orders'

const LIMIT = 10

export default async function UserOrdersPage ({
  searchParams,
}: {
  searchParams: Promise<{ page: string }>
}) {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const orders = await listOrders()

  const { page } = await searchParams

  const pages = Math.ceil(orders.length / LIMIT)
  const currentPage = +page || 1
  const offset = (+currentPage - 1) * LIMIT

  const orderSetsGrouped = orders.reduce(
    (acc, order) => {
      const orderSetId = (order as any).order_set.id
      if (!acc[orderSetId]) {
        acc[orderSetId] = []
      }
      acc[orderSetId].push(order)
      return acc
    },
    {} as Record<string, typeof orders>
  )

  const orderSets = Object.entries(orderSetsGrouped).map(([orderSetId, orderList]) => {
    const firstOrder = orderList[0]
    const orderSet = (firstOrder as any).order_set

    return {
      id: orderSetId,
      orders: orderList,
      created_at: orderSet.created_at,
      display_id: orderSet.display_id,
      total: orderList.reduce((sum, order) => sum + order.total, 0),
      currency_code: firstOrder.currency_code,
    }
  })

  const processedOrders = orderSets.slice(offset, offset + LIMIT)

  return (
    <WorkspaceAccountPage title="Orders" testId="orders-page">
      <div className="tese-sourcing-account-body" data-testid="orders-container">
        {isEmpty(orders) ? (
          <WorkspaceAccountEmpty
            title="No orders yet"
            description="You haven't placed any order yet. Once you place an order, it will appear here."
            primaryLabel="Start AI Sourcing"
            primaryHref="/sourcing"
            secondaryLabel="Browse catalogue"
            secondaryHref="/categories"
            testId="orders-empty-state"
          />
        ) : (
          <>
            <div className="w-full max-w-full" data-testid="orders-list">
              {processedOrders.map((orderSet) => (
                <ParcelAccordion
                  key={orderSet.id}
                  orderId={orderSet.id}
                  orderDisplayId={`#${orderSet.display_id}`}
                  createdAt={orderSet.created_at}
                  total={orderSet.total}
                  orders={orderSet.orders || []}
                  currency_code={orderSet.currency_code}
                />
              ))}
            </div>
            <OrdersPagination pages={pages} />
          </>
        )}
      </div>
    </WorkspaceAccountPage>
  )
}
