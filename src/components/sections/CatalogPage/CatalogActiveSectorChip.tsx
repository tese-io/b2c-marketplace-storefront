'use client'

import Cookies from 'js-cookie'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import type { SectorDefinition } from '@/data/sectors'
import {
  INDUSTRY_COOKIE,
  SECTOR_COOKIE,
} from '@/lib/helpers/sector-preferences'

export function CatalogActiveSectorChip({
  sector,
  clearHref,
}: {
  sector: SectorDefinition
  clearHref: string
}) {
  const router = useRouter()

  if (sector.id === 'all') return null

  function handleClear() {
    Cookies.set(SECTOR_COOKIE, 'all', { expires: 365, sameSite: 'lax' })
    Cookies.remove(INDUSTRY_COOKIE)
    router.push(clearHref)
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      className="tese-catalog-sector-chip"
      aria-label={`Clear ${sector.label} filter`}
    >
      {sector.shortLabel}
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export function CatalogSectorLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <LocalizedClientLink href={href} className={className}>
      {children}
    </LocalizedClientLink>
  )
}
