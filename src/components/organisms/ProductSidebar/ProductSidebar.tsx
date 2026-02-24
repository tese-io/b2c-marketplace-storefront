'use client'

import { useState } from 'react'

import { Button } from '@/components/atoms'
import { PriceFilter } from '@/components/cells'
import { ProductListingActiveFilters } from '@/components/organisms'
import useFilters from '@/hooks/useFilters'
import { CloseIcon } from '@/icons'
import { cn } from '@/lib/utils'

const ESG_CATEGORIES = [
  { label: 'Sustainable Products', handle: 'sustainable-products' },
  { label: 'ESG Audits', handle: 'esg-audits' },
  { label: 'Consulting & Advisory', handle: 'consulting' },
  { label: 'Reporting & Disclosure', handle: 'reporting' },
  { label: 'Carbon & Climate', handle: 'carbon-climate' },
  { label: 'Circular Economy', handle: 'circular-economy' },
]

export const ProductSidebar = () => {
  const [filterModal, setFilterModal] = useState(false)
  const { clearAllFilters } = useFilters('')

  return (
    <aside
      className="relative w-full"
      data-testid="sidebar"
    >
      <div
        className={cn(
          'left-0 top-0 h-full w-full bg-primary transition-opacity duration-100 md:relative',
          filterModal ? 'opacity-1 z-20' : '-z-10 opacity-0 md:z-10 md:opacity-100'
        )}
      >
        {filterModal && (
          <div className="md:hidden">
            <div
              className="mb-4 flex items-center justify-between border-y p-4"
              data-testid="sidebar-filter-header"
            >
              <h3 className="heading-md uppercase">Filters</h3>
              <div
                onClick={() => setFilterModal(false)}
                className="cursor-pointer"
                data-testid="sidebar-close-button"
              >
                <CloseIcon size={20} />
              </div>
            </div>
            <div className="mb-4 px-2 md:mb-0">
              <ProductListingActiveFilters />
            </div>
          </div>
        )}

        <div
          className="no-scrollbar h-[calc(100vh-200px)] overflow-y-scroll px-2 md:h-full md:overflow-y-auto md:px-0"
          data-testid="sidebar-filters"
        >
          <div className="mb-4">
            <h4 className="heading-sm mb-3 uppercase">Categories</h4>
            <ul className="flex flex-col gap-2">
              {ESG_CATEGORIES.map((cat) => (
                <li key={cat.handle}>
                  <a
                    href={`/pl/categories/${cat.handle}`}
                    className="label-md block rounded-md px-3 py-2 transition-colors hover:bg-secondary"
                  >
                    {cat.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <PriceFilter />
        </div>
        <div
          className="absolute bottom-0 left-0 flex w-full items-center gap-2 border-y bg-primary px-4 py-4 md:hidden"
          data-testid="sidebar-actions"
        >
          <Button
            className="label-sm w-1/2 uppercase"
            variant="tonal"
            onClick={() => clearAllFilters()}
            data-testid="sidebar-clear-all-button"
          >
            Clear all
          </Button>
          <Button
            className="label-sm w-1/2 uppercase"
            onClick={() => setFilterModal(false)}
            data-testid="sidebar-view-listings-button"
          >
            View listings
          </Button>
        </div>
      </div>
    </aside>
  )
}
