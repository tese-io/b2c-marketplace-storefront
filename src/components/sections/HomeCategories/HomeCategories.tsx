import { CategoryCardB2B } from '@/components/organisms/CategoryCardB2B/CategoryCardB2B'
import type { SectorDefinition, SectorId } from '@/data/sectors'
import { listCategories } from '@/lib/data/categories'
import {
  buildCatalogQuery,
  filterCategoriesBySectorTags,
} from '@/lib/helpers/sector-preferences'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

export async function HomeCategories({
  heading,
  subtitle,
  sector,
  industryHandle,
  sectorId,
}: {
  heading: string
  subtitle?: string
  sector?: SectorDefinition
  industryHandle?: string
  sectorId?: string
}) {
  const { parentCategories } = await listCategories()

  const filtered = sector
    ? filterCategoriesBySectorTags(parentCategories, sector, industryHandle)
    : parentCategories

  if (!filtered?.length) return null

  const count = filtered.length

  const catalogQuery = buildCatalogQuery(
    (sectorId || sector?.id || 'all') as SectorId,
    industryHandle
  )

  return (
    <section className="tese-products-section" aria-labelledby="home-categories-heading">
      <div className="tese-products-section-header">
        <div className="tese-products-section-intro">
          <p className="tese-products-eyebrow">
            <span className="tese-products-eyebrow-dot" aria-hidden />
            Sustainable catalogue
          </p>
          <h2
            id="home-categories-heading"
            className="tese-products-heading"
          >
            {heading}
          </h2>
          {subtitle && (
            <p className="tese-products-subtitle">{subtitle}</p>
          )}
        </div>

        <div className="tese-products-section-actions">
          <span className="tese-products-count">
            {count} {count === 1 ? 'category' : 'categories'}
          </span>
          <LocalizedClientLink
            href={`/categories${catalogQuery}`}
            className="tese-products-view-all"
          >
            View all
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </LocalizedClientLink>
        </div>
      </div>

      <div className="tese-category-grid">
        {filtered.map((category, index) => (
          <CategoryCardB2B
            key={category.id}
            index={index}
            category={{
              name: category.name,
              handle: category.handle,
              description: category.description,
            }}
          />
        ))}
      </div>
    </section>
  )
}
