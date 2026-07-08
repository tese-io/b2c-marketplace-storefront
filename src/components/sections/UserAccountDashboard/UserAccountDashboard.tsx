'use client'

import { HttpTypes } from '@medusajs/types'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { useMatrixUnreads } from '@/components/providers/Matrix/MatrixProvider'
import { UserRecentSourcing } from '@/components/sections/UserAccountDashboard/UserRecentSourcing'

type UserAccountDashboardProps = {
  user: HttpTypes.StoreCustomer
  orderCount: number
  pendingOrderCount: number
  wishlistCount: number
  pendingInquiryCount: number
}

const QUICK_ACTIONS = [
  {
    id: 'sourcing',
    title: 'New AI search',
    description: 'Describe what you need and match certified suppliers.',
    href: '/sourcing',
    pendingKey: null,
  },
  {
    id: 'inquiries',
    title: 'Inquiries',
    description: 'Track RFQs, supplier quotes, and next steps.',
    href: '/sourcing/inquiries',
    pendingKey: 'inquiries',
  },
  {
    id: 'catalogue',
    title: 'Browse catalogue',
    description: 'Explore recycled materials, renewables, and services.',
    href: '/categories',
    pendingKey: null,
  },
  {
    id: 'orders',
    title: 'Orders',
    description: 'Track quotes, purchases, and fulfilment status.',
    href: '/user/orders',
    pendingKey: 'orders',
  },
  {
    id: 'messages',
    title: 'Messages',
    description: 'Continue conversations with suppliers.',
    href: '/user/messages',
    pendingKey: 'messages',
  },
  {
    id: 'wishlist',
    title: 'Wishlist',
    description: 'Review saved listings and shortlisted suppliers.',
    href: '/user/wishlist',
    pendingKey: null,
  },
  {
    id: 'settings',
    title: 'Account settings',
    description: 'Update profile details, password, and preferences.',
    href: '/user/settings',
    pendingKey: null,
  },
] as const

function PendingBadge ({
  count,
  className = '',
}: {
  count: number
  className?: string
}) {
  if (count <= 0) return null

  return (
    <span
      className={`tese-user-dashboard-pending-badge ${className}`.trim()}
      aria-label={`${count} pending`}
    >
      {count}
    </span>
  )
}

function StatCard ({
  label,
  value,
  href,
  pending,
  alwaysShowPending = false,
}: {
  label: string
  value: number | string
  href: string
  pending?: number
  alwaysShowPending?: boolean
}) {
  const showPendingBadge =
    pending != null &&
    pending > 0 &&
    (alwaysShowPending || String(pending) !== String(value))

  return (
    <LocalizedClientLink href={href} className="tese-user-dashboard-stat">
      <div className="tese-user-dashboard-stat-top">
        <span className="tese-user-dashboard-stat-value">{value}</span>
        {showPendingBadge ? <PendingBadge count={pending} /> : null}
      </div>
      <span className="tese-user-dashboard-stat-label">{label}</span>
    </LocalizedClientLink>
  )
}

function QuickActionCard ({
  title,
  description,
  href,
  pending,
}: {
  title: string
  description: string
  href: string
  pending?: number
}) {
  return (
    <LocalizedClientLink href={href} className="tese-user-dashboard-card">
      <div className="tese-user-dashboard-card-head">
        <span className="tese-user-dashboard-card-title">{title}</span>
        <PendingBadge count={pending ?? 0} />
      </div>
      <span className="tese-user-dashboard-card-desc">{description}</span>
    </LocalizedClientLink>
  )
}

export function UserAccountDashboard ({
  user,
  orderCount,
  pendingOrderCount,
  wishlistCount,
  pendingInquiryCount,
}: UserAccountDashboardProps) {
  const unreadCount = useMatrixUnreads()
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ')

  const pendingByKey = {
    orders: pendingOrderCount,
    messages: unreadCount,
    inquiries: pendingInquiryCount,
  } as const

  return (
    <div className="tese-sourcing-account-body" data-testid="user-account-dashboard">
      <div className="tese-user-dashboard-stats">
        <StatCard
          label="Orders"
          value={orderCount}
          href="/user/orders"
          pending={pendingOrderCount}
          alwaysShowPending
        />
        <StatCard
          label="Open inquiries"
          value={pendingInquiryCount}
          href="/sourcing/inquiries"
        />
        <StatCard
          label="Wishlist items"
          value={wishlistCount}
          href="/user/wishlist"
        />
        <StatCard
          label="Unread messages"
          value={unreadCount}
          href="/user/messages"
        />
      </div>

      <section className="tese-user-dashboard-account-card">
        <div>
          <p className="tese-user-dashboard-account-label">Signed in as</p>
          <p className="tese-user-dashboard-account-name">{fullName || 'Your account'}</p>
          <p className="tese-user-dashboard-account-email">{user.email}</p>
        </div>
        <LocalizedClientLink href="/user/settings" className="tese-user-dashboard-account-link">
          Manage account
        </LocalizedClientLink>
      </section>

      <section className="tese-user-dashboard-section">
        <h2 className="tese-user-dashboard-section-title">Quick actions</h2>
        <div className="tese-user-dashboard-grid">
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.id}
              title={action.title}
              description={action.description}
              href={action.href}
              pending={
                action.pendingKey
                  ? pendingByKey[action.pendingKey as keyof typeof pendingByKey]
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      <UserRecentSourcing />
    </div>
  )
}
