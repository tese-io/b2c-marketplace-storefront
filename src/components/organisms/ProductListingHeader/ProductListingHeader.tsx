'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

import { SelectField } from '@/components/molecules'

const selectOptions = [
  { label: 'Newest', value: 'created_at' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' }
]

function listingTypeLink (pathname: string, searchParams: URLSearchParams | null, type: 'product' | 'service' | null): string {
  const params = new URLSearchParams(searchParams?.toString() ?? '')
  if (type) params.set('listing_type', type)
  else params.delete('listing_type')
  const q = params.toString()
  return q ? `${pathname}?${q}` : pathname
}

export const ProductListingHeader = ({
  total,
  listingType,
  showTypeFilters = true,
}: {
  total: number
  listingType?: 'product' | 'service' | null
  showTypeFilters?: boolean
}) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('listing_type')

  return (
    <div
      className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
      data-testid="product-listing-header"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span data-testid="product-listing-total">{total} listings</span>
        {showTypeFilters && (
          <>
            <span className="text-muted-foreground">|</span>
            <nav className="flex gap-2" aria-label="Filter by listing type">
              <Link
                href={listingTypeLink(pathname, searchParams, null)}
                className={`text-sm font-medium ${!current ? 'text-foreground underline' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="listing-type-filter-all"
              >
                All
              </Link>
              <Link
                href={listingTypeLink(pathname, searchParams, 'product')}
                className={`text-sm font-medium ${current === 'product' ? 'text-foreground underline' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="listing-type-filter-product"
              >
                Product
              </Link>
              <Link
                href={listingTypeLink(pathname, searchParams, 'service')}
                className={`text-sm font-medium ${current === 'service' ? 'text-foreground underline' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="listing-type-filter-service"
              >
                Service
              </Link>
            </nav>
          </>
        )}
      </div>
      {/* <div className='hidden md:flex gap-2 items-center'>
        Sort by:{' '}
        <SelectField
          className='min-w-[200px]'
          options={selectOptions}
          selectOption={selectOptionHandler}
          data-testid="product-listing-sort-dropdown"
        />
      </div> */}
    </div>
  );
};
