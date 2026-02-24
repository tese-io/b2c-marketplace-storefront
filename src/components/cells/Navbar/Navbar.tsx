import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"

export const Navbar = ({
  categories,
  parentCategories,
}: {
  categories: HttpTypes.StoreProductCategory[]
  parentCategories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div className="border-t py-2 px-4 md:px-8 lg:px-24" data-testid="navbar">
      <div className="w-full" data-testid="navbar-search">
        <NavbarSearch />
      </div>
    </div>
  )
}
