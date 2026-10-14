'use client'

import Cookies from 'js-cookie'
import { useCallback, useMemo } from 'react'

import { HttpTypes } from '@medusajs/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'


import { useTranslatedSector } from '@/lib/i18n/sector-copy'
import {
  INDUSTRY_COOKIE,
  SECTOR_COOKIE,
} from '@/lib/helpers/sector-preferences'

type SectorIndustryBarProps = {
  categories: HttpTypes.StoreProductCategory[]
  sectorId: string
  industryHandle?: string
}

export function SectorIndustryBar({
  categories,
  sectorId,
  industryHandle,
}: SectorIndustryBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sector = useTranslatedSector(sectorId)

  const industries = useMemo(() => {
    if (sector.id === 'all') return categories
    return categories.filter((c) =>
      sector.categoryHandles.includes(c.handle || '')
    )
  }, [categories, sector])

  const updateFilters = useCallback(
    (nextSector: string, nextIndustry?: string) => {
      Cookies.set(SECTOR_COOKIE, nextSector, { expires: 365, sameSite: 'lax' })
      if (nextIndustry) {
        Cookies.set(INDUSTRY_COOKIE, nextIndustry, { expires: 365, sameSite: 'lax' })
      } else {
        Cookies.remove(INDUSTRY_COOKIE)
      }

      const params = new URLSearchParams(searchParams.toString())
      if (nextSector === 'all') {
        params.delete('sector')
        params.delete('industry')
      } else {
        params.set('sector', nextSector)
        if (nextIndustry) params.set('industry', nextIndustry)
        else params.delete('industry')
      }

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
      router.refresh()
    },
    [pathname, router, searchParams]
  )

  if (sector.id === 'all' && !industryHandle) {
    return (
      <section className="w-full border-b border-black/[0.06] bg-white/80">
        <div className="tese-container py-4">
          <p className="text-sm text-secondary">
            <span className="font-medium text-primary">tese.io</span> is a sustainability-focused marketplace —
            pick a sector in the header to personalise categories and featured listings.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full border-b border-black/[0.06] bg-white/80">
      <div className="tese-container py-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-secondary font-semibold mr-1">
            Industry
          </span>
          <button
            type="button"
            onClick={() => updateFilters(sectorId)}
            className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition cursor-pointer ${
              !industryHandle
                ? 'bg-tese-ink text-tese-lime'
                : 'border border-black/10 text-primary hover:border-tese-lime'
            }`}
          >
            All in {sector.shortLabel}
          </button>
          {industries.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilters(sectorId, cat.handle)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition cursor-pointer ${
                industryHandle === cat.handle
                  ? 'bg-tese-ink text-tese-lime'
                  : 'border border-black/10 text-primary hover:border-tese-lime'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {industryHandle && (
          <p className="text-[13px] text-secondary">
            Showing listings for{' '}
            <span className="font-medium text-primary">
              {industries.find((c) => c.handle === industryHandle)?.name}
            </span>{' '}
            in {sector.label.toLowerCase()}.
          </p>
        )}
      </div>
    </section>
  )
}
