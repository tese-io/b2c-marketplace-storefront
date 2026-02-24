'use client'

import {
  Badge,
  Card,
  Divider,
  LogoutButton,
  NavigationItem,
} from '@/components/atoms'
import { useUnreads } from '@talkjs/react'
import { usePathname } from 'next/navigation'

const MATRIX_CHAT_ENABLED = process.env.NEXT_PUBLIC_MATRIX_CHAT_ENABLED === 'true'

const navigationItems = [
  {
    label: "Orders",
    href: "/user/orders",
  },
  {
    label: "Messages",
    href: "/user/messages",
  },
  {
    label: "Returns",
    href: "/user/returns",
  },
  {
    label: "Addresses",
    href: "/user/addresses",
  },
  {
    label: "Reviews",
    href: "/user/reviews",
  },
  {
    label: "Wishlist",
    href: "/user/wishlist",
  },
]

export function UserNavigation () {
  const unreads = useUnreads()
  const displayUnreads = MATRIX_CHAT_ENABLED ? [] : (unreads ?? [])
  const path = usePathname()

  return (
    <Card className="h-min">
      {navigationItems.map((item) => (
        <NavigationItem
          key={item.label}
          href={item.href}
          active={path === item.href}
          className="relative"
        >
          {item.label}
          {item.label === 'Messages' && Boolean(displayUnreads?.length) && (
            <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
              {displayUnreads.length}
            </Badge>
          )}
        </NavigationItem>
      ))}
      <Divider className="my-2" />
      <NavigationItem
        href={"/user/settings"}
        active={path === "/user/settings"}
      >
        Settings
      </NavigationItem>
      <LogoutButton className="w-full text-left" />
    </Card>
  )
}
