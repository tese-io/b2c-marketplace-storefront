'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface ProductFiltersProps {
  categories: Array<{ value: string; label: string }>
  activeCategory?: string
}

export function ProductFilters({ categories, activeCategory }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [certifications, setCertifications] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<string>('')

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
    <div className="bg-component-primary rounded-sm border border-primary p-6 sticky top-4">
      {/* Categories Section */}
      <div className="mb-6 pb-6 border-b border-primary">
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
            All Products
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

      {/* Certifications Section */}
      <div className="mb-6 pb-6 border-b border-primary">
        <h3 className="label-lg text-primary mb-3">Certifications</h3>
        <div className="space-y-2">
          {['Organic', 'Fair Trade', 'Carbon Neutral', 'B Corporation', 'Cradle to Cradle'].map((cert) => (
            <label key={cert} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                className="rounded border-primary text-action focus:ring-action focus:ring-offset-0"
                checked={certifications.includes(cert)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCertifications([...certifications, cert])
                  } else {
                    setCertifications(certifications.filter(c => c !== cert))
                  }
                }}
              />
              <span className="ml-2 text-sm text-secondary group-hover:text-primary transition-colors">
                {cert}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="mb-6 pb-6 border-b border-primary">
        <h3 className="label-lg text-primary mb-3">Price Range</h3>
        <div className="space-y-2">
          {[
            { value: 'under-25', label: 'Under $25' },
            { value: '25-50', label: '$25 - $50' },
            { value: '50-100', label: '$50 - $100' },
            { value: '100-250', label: '$100 - $250' },
            { value: '250-plus', label: '$250+' },
          ].map((range) => (
            <label key={range.value} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="price"
                className="border-primary text-action focus:ring-action focus:ring-offset-0"
                checked={priceRange === range.value}
                onChange={() => setPriceRange(range.value)}
              />
              <span className="ml-2 text-sm text-secondary group-hover:text-primary transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div>
        <h3 className="label-lg text-primary mb-3">Why Shop Sustainable?</h3>
        <div className="bg-accent rounded-sm p-4 space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-tese-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-primary">ESG Certified</p>
              <p className="text-[12px] text-secondary">All products meet strict sustainability standards</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-tese-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <div>
              <p className="text-sm font-medium text-primary">Verified Vendors</p>
              <p className="text-[12px] text-secondary">Shop from trusted sustainable sellers</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-tese-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <div>
              <p className="text-sm font-medium text-primary">Eco-Friendly</p>
              <p className="text-[12px] text-secondary">Minimal waste, maximum care for the planet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
