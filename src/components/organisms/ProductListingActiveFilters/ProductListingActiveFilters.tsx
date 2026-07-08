"use client"

import { ActiveFilterElement } from "@/components/cells"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"

const ALWAYS_EXCLUDED = ["sortBy", "page", "sold", "products[page]"]

export const ProductListingActiveFilters = ({
  exclude = [],
}: {
  exclude?: string[]
}) => {
  const { allSearchParams } = useGetAllSearchParams()
  const excluded = new Set([...ALWAYS_EXCLUDED, ...exclude])
  const filters = Object.entries(allSearchParams).filter(
    (element) => !excluded.has(element[0])
  )

  return (
    <div className="gap-4 overflow-x-scroll no-scrollbar flex">
      {filters.map((filter) => (
        <ActiveFilterElement key={filter[0]} filter={filter} />
      ))}
    </div>
  )
}
