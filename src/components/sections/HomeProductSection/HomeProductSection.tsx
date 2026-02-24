import { ProductCard } from "@/components/organisms"
import { Product } from "@/types/product"

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  products = [],
  home = false,
}: {
  heading: string
  locale?: string
  products?: Product[]
  home?: boolean
}) => {
  const displayProducts = products.slice(0, 4)

  if (!displayProducts.length) return null

  return (
    <section className="py-8 w-full">
      <h2 className="mb-6 heading-lg text-primary uppercase">
        {heading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  )
}
