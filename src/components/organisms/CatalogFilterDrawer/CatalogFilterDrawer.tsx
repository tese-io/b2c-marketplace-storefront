"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/atoms"
import {
  FacetCounts,
  FilterSections,
} from "@/components/organisms/ProductSidebar/AlgoliaProductSidebar"
import { CloseIcon } from "@/icons"
import { useTranslations } from "next-intl"

const FACET_PARAM_KEYS = [
  "certifications",
  "origin",
  "sectors",
  "categories",
  "circular",
  "verified",
  "co2_min",
  "co2_max",
  "min_price",
  "max_price",
]

const MULTI_VALUE_KEYS = new Set([
  "certifications",
  "origin",
  "sectors",
  "categories",
])

/**
 * Slide-over filter panel (Solar Impulse style): filters live in an
 * on-demand right-hand drawer so the product grid keeps the full width.
 * Filter changes update URL params immediately (the server re-renders the
 * grid behind the drawer); "Show results" simply closes the panel.
 */
export const CatalogFilterDrawer = ({
  facets,
  resultCount,
  showSectors = false,
  showCategories = true,
  categoryLabels,
}: {
  facets: Record<string, FacetCounts>
  resultCount: number
  showSectors?: boolean
  showCategories?: boolean
  categoryLabels?: Record<string, string>
}) => {
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
      (MULTI_VALUE_KEYS.has(key) ? value.split(",").filter(Boolean).length : 1)
    )
  }, 0)

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    FACET_PARAM_KEYS.forEach((key) => params.delete(key))
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen])

  return (
    <>
      <div className="flex items-center gap-3 shrink-0">
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm underline underline-offset-2 whitespace-nowrap"
          >
            Remove filters ({activeCount})
          </button>
        )}
        <Button
          onClick={() => setIsOpen(true)}
          variant="tonal"
          size="large"
          className="flex items-center gap-2 whitespace-nowrap"
          data-testid="catalog-open-filters"
        >
          <svg
            viewBox="0 0 16 16"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path
              d="M2 4h12M4.5 8h7M7 12h2"
              strokeLinecap="round"
            />
          </svg>
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-action text-action-on-primary text-xs h-5 min-w-5 px-1">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label={t("filters")}
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-primary shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="heading-sm">{t("filters")}</h2>
              <div className="flex items-center gap-4">
                {activeCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm underline underline-offset-2"
                  >
                    Remove filters ({activeCount})
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label={t("closeFilters")}
                  data-testid="catalog-close-filters"
                >
                  <CloseIcon size={20} className="cursor-pointer" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <FilterSections
                facets={facets}
                showSectors={showSectors}
                showCategories={showCategories}
                categoryLabels={categoryLabels}
                expandAll
              />
            </div>
            <div className="border-t px-5 py-4">
              <Button
                onClick={() => setIsOpen(false)}
                size="large"
                className="w-full"
                data-testid="catalog-show-results"
              >
                Show {resultCount} {resultCount === 1 ? "result" : "results"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
