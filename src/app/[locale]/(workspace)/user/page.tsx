import { redirect } from 'next/navigation'

import { UserAccountDashboard } from '@/components/sections/UserAccountDashboard/UserAccountDashboard'
import { WorkspaceAccountPage } from '@/components/sections/SourcingAppShell/WorkspaceAccountPage'
import {
  countActionableEnquiries,
  countPendingOrders,
} from '@/lib/helpers/account-pending-counts'
import { retrieveCustomer } from '@/lib/data/customer'
import { listEnquiries } from '@/lib/data/enquiries'
import { listOrders } from '@/lib/data/orders'
import { getUserWishlists } from '@/lib/data/wishlist'

export default async function UserPage ({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await retrieveCustomer()

  if (!user) {
    redirect('/login')
  }

  const [orders, wishlist, enquiries] = await Promise.all([
    listOrders().catch(() => []),
    getUserWishlists({ countryCode: locale }).catch(() => ({ products: [] })),
    listEnquiries().catch(() => []),
  ])

  const orderCount = orders.length
  const wishlistCount = wishlist?.products?.length || 0
  const pendingOrderCount = countPendingOrders(orders)
  const pendingInquiryCount = countActionableEnquiries(enquiries)

  return (
    <WorkspaceAccountPage
      title={`Welcome, ${user.first_name}`}
      lead="Your account is ready. Start a new AI search or browse the catalogue."
      testId="user-account-page"
    >
      <UserAccountDashboard
        user={user}
        orderCount={orderCount}
        pendingOrderCount={pendingOrderCount}
        wishlistCount={wishlistCount}
        pendingInquiryCount={pendingInquiryCount}
      />
    </WorkspaceAccountPage>
  )
}
