'use client'

import { ListingSidebarSearch } from '@/components/molecules/ListingSidebarSearch/ListingSidebarSearch'
import { ListingFilterDrawer } from '@/components/organisms/ListingFilterDrawer/ListingFilterDrawer'
import { ProductListingActiveFilters } from '@/components/organisms/ProductListingActiveFilters/ProductListingActiveFilters'
import { FacetCounts } from '@/components/organisms/ProductSidebar/AlgoliaProductSidebar'

type ListingSearchToolbarProps = {
  count: number
  facets: Record<string, FacetCounts>
  showSectors?: boolean
  searchPlaceholder?: string
}

export function ListingSearchToolbar ({
  count,
  facets,
  showSectors = true,
  searchPlaceholder,
}: ListingSearchToolbarProps) {
  return (
    <div className="tese-listing-toolbar">
      <div className="tese-listing-toolbar-row">
        <div className="tese-seller-listing-count">{`${count} listings`}</div>
        <div className="tese-listing-toolbar-controls">
          <ListingSidebarSearch
            variant="toolbar"
            placeholder={searchPlaceholder}
            inputId="listing-toolbar-search"
          />
          <ListingFilterDrawer
            facets={facets}
            resultCount={count}
            showSectors={showSectors}
          />
        </div>
      </div>
      <div className="tese-listing-toolbar-active-filters">
        <ProductListingActiveFilters />
      </div>
    </div>
  )
}
