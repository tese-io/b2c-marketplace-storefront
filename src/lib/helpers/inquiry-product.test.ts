import { describe, expect, it } from 'vitest'

import {
  buildRequirementPills,
  parseQuantityFromRequirement,
  primaryProductHandle,
  uniqueProductHandles,
} from './inquiry-product'
import type { EnquiryTarget } from '@/types/enquiry'

describe('uniqueProductHandles', () => {
  it('returns deduped non-empty handles in order', () => {
    const targets: EnquiryTarget[] = [
      { productHandle: 'yarn-a' },
      { productHandle: 'yarn-b' },
      { productHandle: 'yarn-a' },
      { productHandle: null },
    ]
    expect(uniqueProductHandles(targets)).toEqual(['yarn-a', 'yarn-b'])
  })
})

describe('primaryProductHandle', () => {
  it('returns the first target handle', () => {
    const targets: EnquiryTarget[] = [
      { sellerName: 'No product' },
      { productHandle: 'cotton-yarn' },
      { productHandle: 'other' },
    ]
    expect(primaryProductHandle(targets)).toBe('cotton-yarn')
  })
})

describe('parseQuantityFromRequirement', () => {
  it('extracts quantity before the next sentence', () => {
    expect(
      parseQuantityFromRequirement(
        'Requesting a quote for Yarn. Quantity: 342. Need delivery in Q3.'
      )
    ).toBe('342')
  })

  it('returns null when quantity is absent', () => {
    expect(parseQuantityFromRequirement('Need a quote for solar panels')).toBeNull()
  })
})

describe('buildRequirementPills', () => {
  it('uses structured quantity when present', () => {
    expect(
      buildRequirementPills({ quantity: '50 MT' }, 'Quantity: 342.')
    ).toEqual([{ label: 'Qty', value: '50 MT' }])
  })

  it('falls back to parsing requirement text', () => {
    expect(buildRequirementPills(undefined, 'Quantity: 342.')).toEqual([
      { label: 'Qty', value: '342' },
    ])
  })

  it('skips unit pill when it matches product metadata', () => {
    expect(
      buildRequirementPills({ unit: 'kg' }, '', { unit: 'kg' })
    ).toEqual([])
  })
})
