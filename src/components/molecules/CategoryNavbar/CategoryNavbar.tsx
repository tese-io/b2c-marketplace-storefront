"use client"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { CollapseIcon } from "@/icons"
import { useMemo } from "react"
import {
  getActiveParentHandle,
  findParentCategoryHandle,
  filterCategoriesByParent,
} from "@/lib/helpers/category-utils"
import { useCategoryDropdown } from "./hooks/useCategoryDropdown"
import { CategoryDropdownMenu } from "./components/CategoryDropdownMenu"

interface CategoryNavbarProps {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories?: HttpTypes.StoreProductCategory[]
  onClose?: (state: boolean) => void
  variant?: "default" | "strip"
}

export const CategoryNavbar = ({
  categories,
  parentCategories = [],
  onClose,
  variant = "default",
}: CategoryNavbarProps) => {
  const { category } = useParams<{ category?: string }>()

  const {
    hoveredCategoryId,
    isDropdownVisible,
    shouldRenderDropdown,
    openDropdown,
    setHoveredCategoryId,
    closeDropdown,
  } = useCategoryDropdown()

  const activeParentHandle = useMemo(
    () => getActiveParentHandle(category, categories, parentCategories),
    [category, parentCategories, categories]
  )

  const parentCategoryHandle = useMemo(
    () => findParentCategoryHandle(category, categories),
    [category, categories]
  )

  const filteredCategories = useMemo(
    () =>
      filterCategoriesByParent(
        activeParentHandle,
        categories,
        parentCategories
      ),
    [activeParentHandle, parentCategories, categories]
  )

  const hoveredCategory = useMemo(
    () => filteredCategories.find((cat) => cat.id === hoveredCategoryId),
    [filteredCategories, hoveredCategoryId]
  )

  const handleClose = () => {
    onClose?.(false)
    closeDropdown()
  }

  const handleCategoryMouseEnter = (categoryId: string) => {
    const cat = filteredCategories.find((c) => c.id === categoryId)
    if (cat?.category_children && cat.category_children.length > 0) {
      openDropdown(categoryId)
    }
  }

  const handleCategoryMouseLeave = () => {
    setHoveredCategoryId(null)
  }

  const handleDropdownMouseEnter = () => {
    if (hoveredCategoryId) {
      setHoveredCategoryId(hoveredCategoryId)
    }
  }

  const handleDropdownMouseLeave = () => {
    setHoveredCategoryId(null)
  }
  const isStrip = variant === "strip"

  return (
    <>
      <nav
        className={cn(
          "flex items-center gap-1.5",
          isStrip
            ? "overflow-x-auto scrollbar-hide max-w-full pb-0.5"
            : "md:items-center flex-col md:flex-row md:overflow-x-auto md:scrollbar-hide md:max-w-full gap-2"
        )}
        aria-label="Category navigation"
        data-testid="category-navbar"
      >
        <LocalizedClientLink
          href="/categories"
          onClick={handleClose}
          className={cn(
            isStrip
              ? "tese-nav-pill shrink-0"
              : "label-md uppercase px-2 my-1 md:my-0 flex items-center justify-between md:flex-shrink-0 text-primary"
          )}
          data-testid="category-link-all-products"
        >
          All products
        </LocalizedClientLink>

        {filteredCategories.map(({ id, handle, name, category_children }) => {
          const categoryUrl = `/categories/${handle}`
          const isActive =
            handle === category || handle === parentCategoryHandle
          const hasChildren = category_children && category_children.length > 0

          return (
            <div
              key={id}
              className="shrink-0"
              onMouseEnter={() => handleCategoryMouseEnter(id)}
              onMouseLeave={handleCategoryMouseLeave}
            >
              <LocalizedClientLink
                href={categoryUrl}
                onClick={handleClose}
                className={cn(
                  isStrip
                    ? cn("tese-nav-pill inline-flex items-center gap-1", isActive && "tese-nav-pill-active")
                    : cn(
                        "label-md uppercase px-2 py-1 my-3 md:my-0 flex items-center justify-between md:whitespace-nowrap text-primary relative z-10",
                        isActive && "md:border-b md:border-primary"
                      )
                )}
                data-testid={`category-link-${handle}`}
              >
                {name}
                {hasChildren && !isStrip && (
                  <CollapseIcon size={18} className="-rotate-90 md:hidden" />
                )}
              </LocalizedClientLink>
            </div>
          )
        })}
      </nav>

      {shouldRenderDropdown && hoveredCategory && (
        <CategoryDropdownMenu
          category={hoveredCategory}
          isVisible={isDropdownVisible}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
          onLinkClick={handleClose}
        />
      )}
    </>
  )
}
