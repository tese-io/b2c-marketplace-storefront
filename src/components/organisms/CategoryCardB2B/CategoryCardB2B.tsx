import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { getCategoryDescription } from '@/data/explorer-copy'
import { categoryHref } from '@/lib/data/categories'

import { getCategoryVisual } from './category-visuals'

export function CategoryCardB2B({
  category,
  index = 0,
}: {
  category: { name: string; handle: string; description?: string | null }
  index?: number
}) {
  const visual = getCategoryVisual(category.handle)
  const description = getCategoryDescription(category.handle, category.description)

  return (
    <LocalizedClientLink
      href={categoryHref(category.handle)}
      className="tese-category-card group cursor-pointer"
      style={{
        ['--cat-accent' as string]: visual.accent,
        ['--cat-accent-soft' as string]: visual.accentSoft,
        ['--cat-icon-bg' as string]: visual.iconBg,
        animationDelay: `${Math.min(index, 7) * 60}ms`,
      }}
    >
      <div className="tese-category-card-body">
        <div
          className="tese-category-card-icon"
          style={{ color: visual.accent }}
        >
          {visual.icon}
        </div>

        <div className="tese-category-card-copy">
          <h3 className="tese-category-card-title">{category.name}</h3>
          {description && (
            <p className="tese-category-card-desc">{description}</p>
          )}
        </div>

        <span className="tese-category-card-cta" aria-hidden>
          Explore
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <span className="tese-category-card-glow" aria-hidden />
    </LocalizedClientLink>
  )
}
