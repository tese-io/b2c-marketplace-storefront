"use client"

import { Button, Input } from "@/components/atoms"
import { Accordion, FilterCheckboxOption, Modal } from "@/components/molecules"
import { ListingSidebarSearch } from "@/components/molecules/ListingSidebarSearch/ListingSidebarSearch"
import { getSectorById } from "@/data/sectors"
import useFilters from "@/hooks/useFilters"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { humanizeCategoryHandle } from "@/lib/helpers/catalog-search"
import { FilterIcon } from "@/icons"
import clsx from "clsx"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { ProductListingActiveFilters } from "../ProductListingActiveFilters/ProductListingActiveFilters"

/** Algolia facet payload: { [facetValue]: count } */
export type FacetCounts = Record<string, number>

export const FilterSections = ({
  facets,
  showSectors = true,
  showCategories = true,
  categoryLabels,
  expandAll = false,
}: {
  facets: Record<string, FacetCounts>
  showSectors?: boolean
  showCategories?: boolean
  categoryLabels?: Record<string, string>
  expandAll?: boolean
}) => {
  const { allSearchParams } = useGetAllSearchParams()

  return (
    <>
      <VerifiedFilter counts={facets['seller.is_verified']} />
      {showCategories && (
        <FacetValuesFilter
          heading="Category"
          paramKey="categories"
          items={facets['categories.handle']}
          defaultOpen={expandAll || Boolean(allSearchParams.categories)}
          formatLabel={(value) =>
            categoryLabels?.[value] || humanizeCategoryHandle(value)
          }
        />
      )}
      <PriceFilter
        defaultOpen={
          expandAll ||
          Boolean(allSearchParams.min_price || allSearchParams.max_price)
        }
      />
      <CircularFilter />
      <FacetValuesFilter
        heading="Certifications"
        paramKey="certifications"
        items={facets["certifications"]}
        defaultOpen={expandAll || Boolean(allSearchParams.certifications)}
      />
      <CarbonFilter
        defaultOpen={
          expandAll ||
          Boolean(allSearchParams.co2_min || allSearchParams.co2_max)
        }
      />
      <FacetValuesFilter
        heading="Origin"
        paramKey="origin"
        items={facets["origin"]}
        defaultOpen={expandAll || Boolean(allSearchParams.origin)}
      />
      {showSectors && (
        <FacetValuesFilter
          heading="Sector"
          paramKey="sectors"
          items={facets["sectors"]}
          defaultOpen={expandAll || Boolean(allSearchParams.sectors)}
          formatLabel={(value) => getSectorById(value).shortLabel}
        />
      )}
    </>
  )
}

function SidebarPanel ({
  facets,
  showSectors,
  searchPlaceholder,
  expandAll = false,
}: {
  facets: Record<string, FacetCounts>
  showSectors?: boolean
  searchPlaceholder?: string
  expandAll?: boolean
}) {
  return (
    <div className="tese-listing-sidebar-panel">
      <ListingSidebarSearch placeholder={searchPlaceholder} />
      <div className="tese-listing-sidebar-active-filters">
        <ProductListingActiveFilters />
      </div>
      <FilterSections
        facets={facets}
        showSectors={showSectors}
        expandAll={expandAll}
      />
    </div>
  )
}

export const AlgoliaProductSidebar = ({
  facets,
  showSectors = true,
  searchPlaceholder,
  isCollapsed = false,
  onToggleCollapsed,
}: {
  facets: Record<string, FacetCounts>
  showSectors?: boolean
  searchPlaceholder?: string
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()

  const activeFilterCount = [
    'query',
    'certifications',
    'origin',
    'sectors',
    'categories',
    'circular',
    'verified',
    'co2_min',
    'co2_max',
    'min_price',
    'max_price',
  ].reduce((acc, key) => {
    const value = searchParams.get(key)
    if (!value) return acc
    if (
      key === 'certifications' ||
      key === 'origin' ||
      key === 'sectors' ||
      key === 'categories'
    ) {
      return acc + value.split(',').filter(Boolean).length
    }
    return acc + 1
  }, 0)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className="tese-listing-sidebar-trigger"
          onClick={() => setIsOpen(true)}
        >
          Search &amp; filters
          {activeFilterCount > 0 && (
            <span className="tese-listing-sidebar-trigger-count">
              {activeFilterCount}
            </span>
          )}
        </button>
        {isOpen && (
          <Modal heading="Search & filters" onClose={() => setIsOpen(false)}>
            <div className="px-4 pb-4">
              <SidebarPanel
                facets={facets}
                showSectors={showSectors}
                searchPlaceholder={searchPlaceholder}
                expandAll
              />
              <Button
                className="w-full mt-4"
                onClick={() => setIsOpen(false)}
              >
                Show results
              </Button>
            </div>
          </Modal>
        )}
      </>
    )
  }

  return (
    <aside
      className={clsx(
        'tese-seller-filters',
        isCollapsed && 'tese-seller-filters--collapsed'
      )}
    >
      <div className="tese-listing-sidebar-header">
        {!isCollapsed && (
          <p className="tese-listing-sidebar-heading">Search &amp; filter</p>
        )}
        {onToggleCollapsed && (
          <button
            type="button"
            className={clsx(
              'tese-listing-sidebar-collapse-btn',
              isCollapsed && 'tese-listing-sidebar-collapse-btn--expand'
            )}
            onClick={onToggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-controls="listing-sidebar-panel"
            aria-label={
              isCollapsed
                ? 'Show search and filters'
                : 'Hide search and filters'
            }
            title={isCollapsed ? 'Show filters' : 'Hide filters'}
          >
            {isCollapsed ? (
              <>
                <FilterIcon size={18} />
                {activeFilterCount > 0 && (
                  <span className="tese-listing-sidebar-rail-count">
                    {activeFilterCount}
                  </span>
                )}
              </>
            ) : (
              <span className="tese-listing-sidebar-collapse-icon" aria-hidden>
                ‹
              </span>
            )}
          </button>
        )}
      </div>
      <div
        id="listing-sidebar-panel"
        className={clsx(
          'tese-listing-sidebar-content',
          isCollapsed && 'tese-listing-sidebar-content--hidden'
        )}
        aria-hidden={isCollapsed}
      >
        <SidebarPanel
          facets={facets}
          showSectors={showSectors}
          searchPlaceholder={searchPlaceholder}
        />
      </div>
      {isCollapsed && activeFilterCount > 0 && (
        <span className="tese-listing-sidebar-rail-label">Filtered</span>
      )}
    </aside>
  )
}

function FacetValuesFilter({
  heading,
  paramKey,
  items,
  defaultOpen = true,
  formatLabel,
}: {
  heading: string
  paramKey: string
  items?: FacetCounts
  defaultOpen?: boolean
  formatLabel?: (value: string) => string
}) {
  const { updateFilters, isFilterActive } = useFilters(paramKey)

  const entries = items ? Object.entries(items) : []
  if (!entries.length) return null

  return (
    <Accordion heading={heading} defaultOpen={defaultOpen}>
      <ul className="px-4">
        {entries.map(([value, count]) => (
          <li key={value} className="mb-4">
            <FilterCheckboxOption
              checked={isFilterActive(value)}
              disabled={Boolean(!count)}
              onCheck={() => updateFilters(value)}
              label={formatLabel ? formatLabel(value) : value}
              amount={Number(count) || undefined}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}

function VerifiedFilter({ counts }: { counts?: FacetCounts }) {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const isActive = searchParams.get("verified") === "true"
  const verifiedCount = counts?.["true"]

  // Hide the toggle when no verified suppliers exist in the current result set
  if (!isActive && !verifiedCount) return null

  return (
    <Accordion heading="Trust" defaultOpen>
      <ul className="px-4">
        <li className="mb-4">
          <FilterCheckboxOption
            checked={isActive}
            onCheck={() => updateSearchParams("verified", isActive ? null : "true")}
            label="tese Verified suppliers"
            amount={verifiedCount || undefined}
          />
        </li>
      </ul>
    </Accordion>
  )
}

function CircularFilter() {
  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()
  const isActive = searchParams.get("circular") === "true"

  return (
    <Accordion heading="Circularity" defaultOpen>
      <ul className="px-4">
        <li className="mb-4">
          <FilterCheckboxOption
            checked={isActive}
            onCheck={() => updateSearchParams("circular", isActive ? null : "true")}
            label="Recycled / circular"
          />
        </li>
      </ul>
    </Accordion>
  )
}

function CarbonFilter({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Accordion heading="Embodied CO₂ (kg / unit)" defaultOpen={defaultOpen}>
      <RangeInputs minKey="co2_min" maxKey="co2_max" />
    </Accordion>
  )
}

function PriceFilter({ defaultOpen = true }: { defaultOpen?: boolean }) {
  return (
    <Accordion heading="Price" defaultOpen={defaultOpen}>
      <RangeInputs minKey="min_price" maxKey="max_price" />
    </Accordion>
  )
}

function RangeInputs({ minKey, maxKey }: { minKey: string; maxKey: string }) {
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")

  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMin(searchParams.get(minKey) || "")
    setMax(searchParams.get(maxKey) || "")
  }, [searchParams, minKey, maxKey])

  const updateMinHandler = (
    e: React.FormEvent<HTMLFormElement> | React.FocusEvent<HTMLInputElement>
  ) => {
    e.preventDefault()
    updateSearchParams(minKey, min)
  }

  const updateMaxHandler = (
    e: React.FormEvent<HTMLFormElement> | React.FocusEvent<HTMLInputElement>
  ) => {
    e.preventDefault()
    updateSearchParams(maxKey, max)
  }

  return (
    <div className="flex gap-2 mb-4 px-4">
      <form method="POST" onSubmit={updateMinHandler}>
        <Input
          placeholder="Min"
          onChange={(e) => setMin(e.target.value)}
          value={min}
          onBlur={(e) => {
            setTimeout(() => {
              updateMinHandler(e)
            }, 500)
          }}
          type="number"
          className="no-arrows-number-input"
        />
        <input type="submit" className="hidden" />
      </form>
      <form method="POST" onSubmit={updateMaxHandler}>
        <Input
          placeholder="Max"
          onChange={(e) => setMax(e.target.value)}
          onBlur={(e) => {
            setTimeout(() => {
              updateMaxHandler(e)
            }, 500)
          }}
          value={max}
          type="number"
          className="no-arrows-number-input"
        />
        <input type="submit" className="hidden" />
      </form>
    </div>
  )
}
