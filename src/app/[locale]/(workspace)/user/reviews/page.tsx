import { LoginForm } from '@/components/molecules'
import { ReviewsToWrite } from '@/components/organisms'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'
import { listOrders } from '@/lib/data/orders'

export default async function ReviewsPage () {
  const user = await retrieveCustomer()

  if (!user) return <LoginForm />

  const orders = await listOrders()

  if (!orders) return null

  return (
    <WorkspaceAccountPage title="Reviews">
      <ReviewsToWrite
        orders={orders.filter((order) => order.reviews.length === 0)}
      />
    </WorkspaceAccountPage>
  )
}
