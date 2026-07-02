'use client'

import { HttpTypes } from '@medusajs/types'
import { useUnreads } from '@talkjs/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { LogoutButton } from '@/components/atoms'
import { TeseLogo } from '@/components/atoms/TeseLogo/TeseLogo'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { CollapseIcon, HamburgerMenuIcon } from '@/icons'
import {
  SidebarBookmarkIcon,
  SidebarHeartIcon,
  SidebarInquiriesIcon,
  SidebarLocationIcon,
  SidebarLogoutIcon,
  SidebarMessageIcon,
  SidebarOrdersIcon,
  SidebarPlusIcon,
  SidebarReturnsIcon,
  SidebarReviewIcon,
  SidebarSearchIcon,
  SidebarSettingsIcon,
  SidebarSparkIcon,
  type SourcingSidebarIconComponent,
} from '@/icons/sourcing-sidebar-icons'
import {
  listSourcingThreads,
  SOURCING_HISTORY_EVENT,
  type SourcingThread,
} from '@/lib/sourcing-history'
import { SourcingPageFooter } from '@/components/sections/SourcingWorkspace/SourcingPageFooter'

type NavItem = {
  id: string
  label: string
  href: string
  icon: SourcingSidebarIconComponent
  match?: (path: string) => boolean
  showUnreadBadge?: boolean
}

type NavSection = {
  label: string
  items: NavItem[]
}

type SourcingAppShellProps = {
  locale: string
  user: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      {
        id: 'chat',
        label: 'New search',
        href: '/sourcing',
        icon: SidebarPlusIcon,
        match: (path) => /\/sourcing\/?$/.test(path),
      },
      {
        id: 'catalogue',
        label: 'Product catalogue',
        href: '/categories',
        icon: SidebarSearchIcon,
        match: (path) => path.includes('/categories'),
      },
      {
        id: 'lists',
        label: 'My lists',
        href: '/sourcing/lists',
        icon: SidebarBookmarkIcon,
        match: (path) => path.includes('/sourcing/lists'),
      },
      {
        id: 'inquiries',
        label: 'Inquiries',
        href: '/sourcing/inquiries',
        icon: SidebarInquiriesIcon,
        match: (path) => path.includes('/sourcing/inquiries'),
      },
    ],
  },
  {
    label: 'Activity',
    items: [
      {
        id: 'messages',
        label: 'Messages',
        href: '/user/messages',
        icon: SidebarMessageIcon,
        match: (path) => path.includes('/user/messages'),
        showUnreadBadge: true,
      },
      {
        id: 'orders',
        label: 'Orders',
        href: '/user/orders',
        icon: SidebarOrdersIcon,
        match: (path) => path.includes('/user/orders'),
      },
      {
        id: 'returns',
        label: 'Returns',
        href: '/user/returns',
        icon: SidebarReturnsIcon,
        match: (path) => path.includes('/user/returns'),
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        id: 'addresses',
        label: 'Addresses',
        href: '/user/addresses',
        icon: SidebarLocationIcon,
        match: (path) => path.includes('/user/addresses'),
      },
      {
        id: 'reviews',
        label: 'Reviews',
        href: '/user/reviews',
        icon: SidebarReviewIcon,
        match: (path) =>
          path.includes('/user/reviews') && !path.includes('/written'),
      },
      {
        id: 'wishlist',
        label: 'Wishlist',
        href: '/user/wishlist',
        icon: SidebarHeartIcon,
        match: (path) => path.includes('/user/wishlist'),
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/user/settings',
        icon: SidebarSettingsIcon,
        match: (path) => path.includes('/user/settings'),
      },
    ],
  },
]

function isActive (pathname: string, item: NavItem) {
  if (item.match) return item.match(pathname)
  return pathname.includes(item.href)
}

function formatRelativeTime (ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function SourcingAppShell ({
  user,
  children,
}: Omit<SourcingAppShellProps, 'locale'>) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const unreads = useUnreads()
  const activeThreadId = searchParams.get('thread')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [threads, setThreads] = useState<SourcingThread[]>([])

  const refreshThreads = useCallback(() => {
    setThreads(listSourcingThreads())
  }, [])

  useEffect(() => {
    refreshThreads()
    window.addEventListener(SOURCING_HISTORY_EVENT, refreshThreads)
    return () => window.removeEventListener(SOURCING_HISTORY_EVENT, refreshThreads)
  }, [refreshThreads])

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const userLabel = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Account'
    : 'Sign in'

  const unreadCount = unreads?.length ?? 0

  return (
    <div className="tese-sourcing-app">
      <div
        className={`tese-sourcing-overlay ${sidebarOpen ? 'is-open' : ''}`}
        onClick={closeSidebar}
        aria-hidden={!sidebarOpen}
      />

      <aside
        className={`tese-sourcing-sidebar ${sidebarOpen ? 'is-open' : ''}`}
        aria-label="Sourcing workspace navigation"
      >
        <div className="tese-sourcing-sidebar-head">
          <TeseLogo variant="dark" className="tese-sourcing-logo" />
          <button
            type="button"
            className="tese-sourcing-icon-btn lg:hidden"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <CollapseIcon size={20} />
          </button>
        </div>

        <nav className="tese-sourcing-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="tese-sourcing-nav-section">
              <p className="tese-sourcing-nav-section-label">{section.label}</p>
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(pathname, item)
                return (
                  <LocalizedClientLink
                    key={item.id}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`tese-sourcing-nav-item ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={18} className="shrink-0 tese-sourcing-sidebar-icon" />
                    <span className="tese-sourcing-nav-item-label">{item.label}</span>
                    {item.showUnreadBadge && unreadCount > 0 ? (
                      <span className="tese-sourcing-nav-badge" aria-label={`${unreadCount} unread messages`}>
                        {unreadCount}
                      </span>
                    ) : null}
                  </LocalizedClientLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="tese-sourcing-sidebar-foot">
          <p className="tese-sourcing-history-label">Recent</p>
          {threads.length > 0 ? (
            <ul className="tese-sourcing-history-list">
              {threads.slice(0, 8).map((thread) => {
                const isActiveThread =
                  activeThreadId === thread.id && pathname.includes('/sourcing')
                return (
                  <li key={thread.id}>
                    <LocalizedClientLink
                      href={`/sourcing?thread=${thread.id}`}
                      onClick={closeSidebar}
                      className={`tese-sourcing-history-item ${isActiveThread ? 'is-active' : ''}`}
                      title={thread.title}
                    >
                      <span className="tese-sourcing-history-item-title">{thread.title}</span>
                      <span className="tese-sourcing-history-item-time">
                        {formatRelativeTime(thread.updatedAt)}
                      </span>
                    </LocalizedClientLink>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="tese-sourcing-history-empty">
              Searches appear here as you work
            </p>
          )}
          <LocalizedClientLink
            href="/"
            onClick={closeSidebar}
            className="tese-sourcing-nav-item tese-sourcing-sidebar-marketplace"
          >
            <SidebarSparkIcon size={18} className="shrink-0 tese-sourcing-sidebar-icon" />
            <span className="tese-sourcing-nav-item-label">Marketplace</span>
          </LocalizedClientLink>
        </div>

        <div className="tese-sourcing-sidebar-bottom">
          {user ? (
            <LogoutButton
              unstyled
              className="tese-sourcing-nav-item tese-sourcing-sidebar-logout"
              data-testid="sidebar-logout-button"
            >
              <SidebarLogoutIcon size={18} className="shrink-0 tese-sourcing-sidebar-icon" />
              <span className="tese-sourcing-nav-item-label">Log out</span>
            </LogoutButton>
          ) : (
            <LocalizedClientLink
              href="/login"
              onClick={closeSidebar}
              className="tese-sourcing-nav-item tese-sourcing-sidebar-logout"
            >
              <SidebarLogoutIcon size={18} className="shrink-0 tese-sourcing-sidebar-icon" />
              <span className="tese-sourcing-nav-item-label">Sign in</span>
            </LocalizedClientLink>
          )}
        </div>
      </aside>

      <div className="tese-sourcing-main">
        <header className="tese-sourcing-topbar">
          <div className="tese-sourcing-topbar-left">
            <button
              type="button"
              className="tese-sourcing-icon-btn lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <HamburgerMenuIcon size={20} />
            </button>
            <LocalizedClientLink
              href="/"
              className="tese-sourcing-back-link hidden sm:inline-flex"
            >
              ← Marketplace
            </LocalizedClientLink>
          </div>

          <div className="tese-sourcing-topbar-right">
            <LocalizedClientLink
              href="/categories"
              className="tese-sourcing-topbar-link hidden md:inline-flex"
            >
              Browse catalogue
            </LocalizedClientLink>
            <LocalizedClientLink
              href={user ? '/user' : '/login'}
              className="tese-sourcing-user-chip"
            >
              <span className="tese-sourcing-user-avatar" aria-hidden>
                {userLabel.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline truncate max-w-[120px]">
                {userLabel}
              </span>
            </LocalizedClientLink>
          </div>
        </header>

        <main className="tese-sourcing-content" id="sourcing-main">
          {children}
        </main>

        <SourcingPageFooter />
      </div>
    </div>
  )
}
