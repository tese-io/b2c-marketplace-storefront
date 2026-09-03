'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/atoms'
import {
  FacetCounts,
  FilterSections,
} from '@/components/organisms/ProductSidebar/AlgoliaProductSidebar'
import { CloseIcon, FilterIcon } from '@/icons'
import { useTranslations } from 'next-intl'

const FACET_PARAM_KEYS = [
  'certifications',
  'origin',
  'sectors',
  'circular',
  'verified',
  'co2_min',
  'co2_max',
  'min_price',
  'max_price',
]

const MULTI_VALUE_KEYS = new Set(['certifications', 'origin', 'sectors'])

export function ListingFilterDrawer ({
  facets,
  resultCount,
  showSectors = false,
}: {
  facets: Record<string, FacetCounts>
  resultCount: number
  showSectors?: boolean
}) {
  const t = useTranslations("filters")
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeCount = FACET_PARAM_KEYS.reduce((acc, key) => {
    const value = searchParams.get(key)
    if (!value) return acc
    return (
      acc +
      (MULTI_VALUE_KEYS.has(key) ? value.split(',').filter(Boolean).length : 1)
    )
  }, 0)

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    FACET_PARAM_KEYS.forEach((key) => params.delete(key))
    params.delete('page')
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        className="tese-listing-filter-btn"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        data-testid="listing-open-filters"
      >
        <FilterIcon size={18} />
        <span>{t("filters")}</span>
        {activeCount > 0 && (
          <span className="tese-listing-filter-btn-count">{activeCount}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="tese-listing-filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={t("filters")}
        >
          <div
            className="tese-listing-filter-drawer-scrim"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div className="tese-listing-filter-drawer-panel">
            <div className="tese-listing-filter-drawer-header">
              <h2 className="tese-listing-filter-drawer-title">{t("filters")}</h2>
              <div className="tese-listing-filter-drawer-header-actions">
                {activeCount > 0 && (
                  <button
                    type="button"
                    className="tese-listing-filter-drawer-clear"
                    onClick={clearFilters}
                  >
                    Clear ({activeCount})
                  </button>
                )}
                <button
                  type="button"
                  className="tese-listing-filter-drawer-close"
                  onClick={() => setIsOpen(false)}
                  aria-label={t("closeFilters")}
                  data-testid="listing-close-filters"
                >
                  <CloseIcon size={20} />
                </button>
              </div>
            </div>
            <div className="tese-listing-filter-drawer-body">
              <FilterSections
                facets={facets}
                showSectors={showSectors}
                expandAll
              />
            </div>
            <div className="tese-listing-filter-drawer-footer">
              <Button
                onClick={() => setIsOpen(false)}
                size="large"
                className="w-full"
                data-testid="listing-show-results"
              >
                Show {resultCount} {resultCount === 1 ? 'result' : 'results'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
