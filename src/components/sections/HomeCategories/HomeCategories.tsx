import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: {
  id: number
  name: string
  handle: string
  image: string
}[] = [
  {
    id: 1,
    name: "Sustainable Products",
    handle: "sustainable-products",
    image: "/images/categories/sustainable-products.jpg",
  },
  {
    id: 2,
    name: "ESG Audits",
    handle: "esg-audits",
    image: "/images/categories/esg-audits.jpg",
  },
  {
    id: 3,
    name: "Consulting & Advisory",
    handle: "consulting",
    image: "/images/categories/consulting.jpg",
  },
  {
    id: 4,
    name: "Reporting & Disclosure",
    handle: "reporting",
    image: "/images/categories/reporting.jpg",
  },
  {
    id: 5,
    name: "Carbon & Climate",
    handle: "carbon-climate",
    image: "/images/categories/carbon-climate.jpg",
  },
  {
    id: 6,
    name: "Circular Economy",
    handle: "circular-economy",
    image: "/images/categories/circular-economy.jpg",
  },
]

export const HomeCategories = async ({
  heading,
  useGrid = false
}: {
  heading: string
  useGrid?: boolean
}) => {
  return (
    <section className="bg-primary py-8 w-full">
      <div className="mb-6">
        <h2 className="heading-lg text-primary uppercase">{heading}</h2>
      </div>
      {useGrid ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <Carousel
          items={categories?.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        />
      )}
    </section>
  )
}
