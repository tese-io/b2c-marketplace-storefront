import { describe, expect, it } from 'vitest'

import {
  buildCatalogFilters,
  buildFacetFilterClauses,
  humanizeCategoryHandle,
} from './catalog-search'
import { getSectorById } from '@/data/sectors'

describe('buildCatalogFilters', () => {
  it('always scopes out suspended sellers', () => {
    expect(buildCatalogFilters({})).toBe('NOT seller.store_status:SUSPENDED')
  })

  it('matches a sector via the sectors facet OR its fallback category handles', () => {
    const filters = buildCatalogFilters({ sector: getSectorById('energy') })
    expect(filters).toContain('(sectors:"energy" OR categories.handle:"renewable-energy")')
  })

  it('ignores the "all" sector', () => {
    const filters = buildCatalogFilters({ sector: getSectorById('all') })
    expect(filters).not.toContain('sectors:')
  })

  it('adds industry, category id and service listing clauses', () => {
    const filters = buildCatalogFilters({
      industryHandle: 'packaging',
      categoryId: 'pcat_123',
      listingType: 'service',
    })
    expect(filters).toContain('categories.handle:"packaging"')
    expect(filters).toContain('categories.id:"pcat_123"')
    expect(filters).toContain('listing_type:service')
  })
})

describe('buildFacetFilterClauses', () => {
  it('returns no clauses for empty params', () => {
    expect(buildFacetFilterClauses({})).toEqual([])
  })

  it('builds OR groups for comma-separated multi-select values', () => {
    const clauses = buildFacetFilterClauses({
      certifications: 'ISO 9001,GRS',
      categories: 'packaging',
    })
    expect(clauses).toContain('(certifications:"ISO 9001" OR certifications:"GRS")')
    expect(clauses).toContain('(categories.handle:"packaging")')
  })

  it('escapes quotes in values', () => {
    const clauses = buildFacetFilterClauses({ origin: 'EU ("west")' })
    expect(clauses).toContain('(origin:"EU (\\"west\\")")')
  })

  it('maps the circular and verified toggles', () => {
    expect(buildFacetFilterClauses({ circular: 'true' })).toContain('is_circular:true')
    expect(buildFacetFilterClauses({ verified: 'true' })).toContain(
      'seller.is_verified:true'
    )
    expect(buildFacetFilterClauses({ circular: 'false' })).toEqual([])
  })

  it('builds numeric ranges for carbon and price', () => {
    expect(buildFacetFilterClauses({ co2_min: '10', co2_max: '100' })).toContain(
      'co2_kg_per_unit:10 TO 100'
    )
    expect(buildFacetFilterClauses({ co2_max: '50' })).toContain(
      'co2_kg_per_unit <= 50'
    )
    expect(buildFacetFilterClauses({ min_price: '5' })).toContain(
      'variants.prices.amount >= 5'
    )
  })

  it('ignores non-numeric range values', () => {
    expect(buildFacetFilterClauses({ co2_min: 'abc' })).toEqual([])
  })

  it('uses the minimum rating from a multi-value rating param', () => {
    expect(buildFacetFilterClauses({ rating: '4,5' })).toContain('average_rating >= 4')
  })

  it('ignores unrelated params (no broken " AND :" clauses)', () => {
    const clauses = buildFacetFilterClauses({
      sector: 'energy',
      industry: 'packaging',
      page: '2',
      query: 'steel',
    } as Record<string, string>)
    expect(clauses).toEqual([])
  })
})

describe('humanizeCategoryHandle', () => {
  it('title-cases handles and preserves ampersands', () => {
    expect(humanizeCategoryHandle('metals-&-alloys')).toBe('Metals & Alloys')
    expect(humanizeCategoryHandle('renewable-energy')).toBe('Renewable Energy')
    expect(humanizeCategoryHandle('packaging')).toBe('Packaging')
  })
})
