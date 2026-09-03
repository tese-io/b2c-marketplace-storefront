"use client"

import {
  Badge,
  Divider,
  LogoutButton,
  NavigationItem,
} from "@/components/atoms"
import { Dropdown } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ProfileIcon } from "@/icons"
import { HttpTypes } from "@medusajs/types"
import { useMatrixUnreads } from "@/components/providers/Matrix/MatrixProvider"
import { useState } from "react"
import { useTranslations } from "next-intl"

export const UserDropdown = ({
  isLoggedIn,
}: {
  isLoggedIn: boolean
}) => {
  const t = useTranslations("account")
  const [open, setOpen] = useState(false)

  const unreads = useMatrixUnreads()

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
        aria-label={t("goToProfile")}
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
            <NavigationItem href="/sourcing">{t("aiSourcing")}</NavigationItem>
            <NavigationItem href="/user/orders">{t("orders")}</NavigationItem>
            <NavigationItem href="/user/messages" className="relative">
              Messages
              {unreads > 0 && (
                <Badge className="absolute top-3 left-24 w-4 h-4 p-0">
                  {unreads}
                </Badge>
              )}
            </NavigationItem>
            <NavigationItem href="/user/returns">{t("returns")}</NavigationItem>
            <NavigationItem href="/user/addresses">{t("addresses")}</NavigationItem>
            <NavigationItem href="/user/reviews">{t("reviews")}</NavigationItem>
            <NavigationItem href="/user/wishlist">{t("wishlist")}</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">{t("settings")}</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/login">{t("signIn")}</NavigationItem>
            <NavigationItem href="/register">{t("createAccount")}</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  )
}
