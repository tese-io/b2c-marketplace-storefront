"use client"
import { Chip } from "@/components/atoms"
import { humanizeCategoryHandle } from "@/lib/helpers/catalog-search"
import useFilters from "@/hooks/useFilters"
import { CloseIcon } from "@/icons"

const filtersLabels = {
  category: "Category",
  categories: "Category",
  brand: "Brand",
  min_price: "Min Price",
  max_price: "Max Price",
  color: "Color",
  size: "Size",
  query: "Search",
  condition: "Condition",
  rating: "Rating",
  certifications: "Certifications",
  origin: "Origin",
  circular: "Circular",
  verified: "Verified",
  co2_min: "Min CO₂",
  co2_max: "Max CO₂",
  sectors: "Sector",
}

const TOGGLE_KEYS = new Set(["circular", "verified", "sale"])

export const ActiveFilterElement = ({ filter }: { filter: string[] }) => {
  const { updateFilters } = useFilters(filter[0])

  const activeFilters = filter[1].split(",")
  const displayValue = (value: string) => {
    if (TOGGLE_KEYS.has(filter[0]) && value === "true") return "Yes"
    if (filter[0] === "categories") return humanizeCategoryHandle(value)
    return value
  }

  const removeFilterHandler = (filter: string) => {
    updateFilters(filter)
  }

  return (
    <div className="flex gap-2 items-center mb-4">
      <span className="label-md hidden md:inline-block">
        {filtersLabels[filter[0] as keyof typeof filtersLabels]}:
      </span>
      {activeFilters.map((element) => {
        const Element = () => {
          return (
            <span className="flex gap-2 items-center cursor-default whitespace-nowrap">
              {displayValue(element)}{" "}
              <span onClick={() => removeFilterHandler(element)}>
                <CloseIcon size={16} className="cursor-pointer" />
              </span>
            </span>
          )
        }
        return <Chip key={element} value={<Element />} />
      })}
    </div>
  )
}
