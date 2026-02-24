'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ServiceFiltersProps {
  categories: Array<{ value: string; label: string }>
  activeCategory?: string
}

export function ServiceFilters({ categories, activeCategory }: ServiceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleCategoryChange(category?: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="label-lg text-primary mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`w-full text-left px-3 py-2 rounded-xs text-sm transition-colors ${
              !activeCategory
                ? 'bg-action text-action-on-primary font-medium'
                : 'text-secondary hover:bg-component-secondary-hover'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`w-full text-left px-3 py-2 rounded-xs text-sm transition-colors ${
                activeCategory === cat.value
                  ? 'bg-action text-action-on-primary font-medium'
                  : 'text-secondary hover:bg-component-secondary-hover'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-primary pt-6">
        <h3 className="label-lg text-primary mb-3">Quick Info</h3>
        <div className="bg-accent rounded-sm p-4 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-tese-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-primary">Verified Providers</p>
              <p className="text-[12px] text-secondary">All providers are verified for ESG expertise</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-tese-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-primary">Escrow Protection</p>
              <p className="text-[12px] text-secondary">Payments held until deliverables are approved</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-tese-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-primary">Direct Negotiation</p>
              <p className="text-[12px] text-secondary">Chat & negotiate directly with providers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
