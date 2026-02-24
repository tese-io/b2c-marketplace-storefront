'use client'

import {
  Badge,
  Divider,
  LogoutButton,
  NavigationItem,
} from '@/components/atoms'
import { Dropdown } from '@/components/molecules'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ProfileIcon } from '@/icons'
import { HttpTypes } from '@medusajs/types'
import { useUnreads } from '@talkjs/react'
import { useState } from 'react'

const MATRIX_CHAT_ENABLED = process.env.NEXT_PUBLIC_MATRIX_CHAT_ENABLED === 'true'

export function UserDropdown ({
  isLoggedIn
}: {
  isLoggedIn: boolean
}) {
  const [open, setOpen] = useState(false)

  const unreads = useUnreads()
  const displayUnreads = MATRIX_CHAT_ENABLED ? [] : (unreads ?? [])

  return (
    <div
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <LocalizedClientLink
        href={isLoggedIn ? "/user" : "/login"}
        className="relative"
        aria-label="Go to user profile"
      >
        <ProfileIcon size={20} />
      </LocalizedClientLink>
      <Dropdown show={open}>
        {isLoggedIn ? (
          <div className="p-1">
            <div className="lg:w-[200px]">
              <h3 className="uppercase heading-xs border-b p-4">
                Your account
              </h3>
            </div>
            <NavigationItem href="/user/orders">Orders</NavigationItem>
            <NavigationItem href="/user/messages" className="relative">
              Messages
              {Boolean(displayUnreads?.length) && (
                <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
                  {displayUnreads.length}
                </Badge>
              )}
            </NavigationItem>
            <NavigationItem href="/user/returns">Returns</NavigationItem>
            <NavigationItem href="/user/addresses">Addresses</NavigationItem>
            <NavigationItem href="/user/reviews">Reviews</NavigationItem>
            <NavigationItem href="/user/wishlist">Wishlist</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">Settings</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/login">Login</NavigationItem>
            <NavigationItem href="/register">Register</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
