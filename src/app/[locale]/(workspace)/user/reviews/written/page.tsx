import { LoginForm } from '@/components/molecules'
import { ReviewsWritten } from '@/components/organisms'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import { retrieveCustomer } from '@/lib/data/customer'
import { listOrders } from '@/lib/data/orders'
import { getReviews } from '@/lib/data/reviews'

export default async function ReviewsWrittenPage () {
  const user = await retrieveCustomer()

  const reviewsRes = await getReviews()
  const orders = await listOrders()

  if (!user) return <LoginForm />

  return (
    <WorkspaceAccountPage title="Reviews">
      <ReviewsWritten
        orders={orders.filter((order) => order.reviews.length)}
        reviews={reviewsRes.data?.reviews.filter(Boolean) ?? []}
        isError={!reviewsRes.ok}
      />
    </WorkspaceAccountPage>
  )
}
