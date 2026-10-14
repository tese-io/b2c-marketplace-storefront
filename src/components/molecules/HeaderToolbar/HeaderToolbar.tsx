"use client"

import { HttpTypes } from "@medusajs/types"

import { Badge } from "@/components/atoms"
import { CartDropdown } from "@/components/cells"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { HeartIcon } from "@/icons"
import CountrySelector from "@/components/molecules/CountrySelector/CountrySelector"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { LanguageSelector } from "@/components/molecules/LanguageSelector/LanguageSelector"
import { MessageButton } from "@/components/molecules/MessageButton/MessageButton"
import { useTranslations } from "next-intl"

type HeaderToolbarProps = {
  regions: HttpTypes.StoreRegion[]
  isLoggedIn: boolean
  wishlistCount: number
}

export function HeaderToolbar({
  regions,
  isLoggedIn,
  wishlistCount,
}: HeaderToolbarProps) {
  const t = useTranslations("header")

  return (
    <div className="flex items-center gap-3 shrink-0 ml-auto" data-testid="header-actions">
      <LocalizedClientLink
        href="/sourcing"
        className="hidden sm:inline-flex items-center rounded-lg bg-tese-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-tese-ink-soft transition shrink-0"
        data-testid="header-sourcing-cta"
      >
        {t("getInTouch")}
      </LocalizedClientLink>

      <CountrySelector regions={regions} variant="header" />

      <LanguageSelector variant="header" />

      <div className="flex items-center gap-1 text-primary" aria-label={t("accountAndCart")}>
        {isLoggedIn && <MessageButton />}
        <UserDropdown isLoggedIn={isLoggedIn} />
        {isLoggedIn && (
          <LocalizedClientLink
            href="/user/wishlist"
            className="tese-header-icon-plain relative"
            data-testid="header-wishlist-link"
            aria-label={t("wishlist")}
          >
            <HeartIcon size={22} />
            {Boolean(wishlistCount) && (
              <Badge
                className="absolute -top-1 -right-1 min-w-4 h-4 p-0 text-[10px]"
                data-testid="wishlist-count-badge"
              >
                {wishlistCount}
              </Badge>
            )}
          </LocalizedClientLink>
        )}
        <CartDropdown />
      </div>
    </div>
  )
}
