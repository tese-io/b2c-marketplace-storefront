'use client'

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'
import Cookies from 'js-cookie'
import { Fragment, useCallback, useMemo } from 'react'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'

import { SECTORS } from '@/data/sectors'
import {
  INDUSTRY_COOKIE,
  SECTOR_COOKIE,
} from '@/lib/helpers/sector-preferences'

function SectorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  )
}

export function SectorSelector({
  compact = false,
  variant = "default",
}: {
  compact?: boolean
  variant?: "default" | "header"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale } = useParams()

  const currentSectorId = searchParams.get('sector') || 'all'
  const current = useMemo(
    () => SECTORS.find((s) => s.id === currentSectorId) || SECTORS[0],
    [currentSectorId]
  )

  const applySector = useCallback(
    (sectorId: string) => {
      Cookies.set(SECTOR_COOKIE, sectorId, { expires: 365, sameSite: 'lax' })
      Cookies.remove(INDUSTRY_COOKIE)

      const params = new URLSearchParams(searchParams.toString())
      if (sectorId === 'all') {
        params.delete('sector')
        params.delete('industry')
      } else {
        params.set('sector', sectorId)
        params.delete('industry')
      }

      const query = params.toString()
      const base = pathname || `/${locale}`
      router.push(query ? `${base}?${query}` : base)
      router.refresh()
    },
    [locale, pathname, router, searchParams]
  )

  const isHeader = variant === "header"

  return (
    <div className="relative flex items-center gap-2">
      {!compact && !isHeader && (
        <span className="label-md hidden lg:block text-secondary whitespace-nowrap">
          Sector
        </span>
      )}
      <Listbox value={current} onChange={(s) => applySector(s.id)}>
        <ListboxButton
          className={
            isHeader
              ? "tese-header-chip relative flex min-h-10 cursor-pointer items-center gap-1.5 px-2.5 text-left text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-tese-lime/40"
              : "relative flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-black/[0.08] bg-component-secondary px-2.5 py-2 text-left text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-tese-lime/40"
          }
          aria-label="Select sector to personalise marketplace"
        >
          <SectorIcon className="h-4 w-4 text-tese-ice shrink-0" />
          <span className="max-w-[7rem] truncate sm:max-w-[9rem]">
            {compact ? current.shortLabel : current.label}
          </span>
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute right-0 top-full z-30 mt-1 max-h-72 min-w-[220px] overflow-auto rounded-xl border bg-white py-1 text-sm shadow-lg focus:outline-none">
            {SECTORS.map((sector) => (
              <ListboxOption
                key={sector.id}
                value={sector}
                className="cursor-pointer select-none px-3 py-2.5 data-[focus]:bg-tese-surface data-[selected]:font-semibold"
              >
                <span className="block">{sector.label}</span>
                {sector.id !== 'all' && (
                  <span className="block text-[11px] text-secondary mt-0.5 leading-snug">
                    {sector.categoryHandles.length} industries
                  </span>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </Listbox>
    </div>
  )
}
