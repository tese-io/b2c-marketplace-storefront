import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import Image from "next/image"

const categoryDescriptions: Record<string, string> = {
  'sustainable-products': 'Eco-friendly & ethical products',
  'esg-audits': 'Comprehensive ESG assessments',
  'consulting': 'Expert sustainability guidance',
  'reporting': 'Impact & compliance reporting',
  'carbon-climate': 'Carbon footprint solutions',
  'circular-economy': 'Zero-waste initiatives',
}

export function CategoryCard({
  category,
}: {
  category: { name: string; handle: string; image?: string }
}) {
  const imageSrc =
    category.image ?? `/images/categories/${category.handle}.png`
  const description = categoryDescriptions[category.handle] || 'Explore more'

  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="group relative flex flex-col overflow-hidden rounded-lg bg-component-primary border border-primary hover:border-action transition-all duration-300 hover:shadow-lg w-full max-w-[320px] h-[400px]"
    >
      {/* Image Container */}
      <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-accent to-component-secondary">
        <Image
          loading="lazy"
          src={imageSrc}
          alt={`${category.name} category`}
          fill
          sizes="(min-width: 1024px) 320px, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />

        {/* Floating badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-action text-action-on-primary text-xs font-medium rounded-full shadow-md">
          Explore
        </div>
      </div>

      {/* Content Container */}
      <div className="flex-1 p-6 bg-component-primary">
        <h3 className="heading-sm text-primary mb-2 group-hover:text-action transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-secondary line-clamp-2">
          {description}
        </p>

        {/* Arrow icon */}
        <div className="mt-4 flex items-center text-sm font-medium text-action opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
          <span>View Category</span>
          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
