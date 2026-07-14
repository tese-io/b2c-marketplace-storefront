import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('@/components/sections/SourcingInquiries/SendInquiryButton', () => ({
  SendInquiryButton: () => createElement('button', null, 'Send inquiry'),
}))

import {
  CatalogCard,
  SourcingResultsRail,
  mergeRailResults,
  latestRailResultsFromMessages,
} from './SourcingResultsRail'

describe('mergeRailResults', () => {
  it('keeps prior results when next lists are empty', () => {
    const prev = {
      catalog_picks: [{ handle: 'solar-a', title: 'Solar A' }],
      suppliers: [{ name: 'Canadian Solar' }],
    }
    expect(mergeRailResults(prev, { catalog_picks: [], suppliers: [] })).toEqual(prev)
  })

  it('replaces when next lists arrive', () => {
    const prev = {
      catalog_picks: [{ handle: 'old', title: 'Old' }],
      suppliers: [{ name: 'Old Co' }],
    }
    const next = {
      catalog_picks: [{ handle: 'new', title: 'New' }],
      suppliers: [{ name: 'New Co' }],
    }
    expect(mergeRailResults(prev, next)).toEqual(next)
  })

  it('partially updates when only one list is returned', () => {
    const prev = {
      catalog_picks: [{ handle: 'keep', title: 'Keep' }],
      suppliers: [{ name: 'Old Co' }],
    }
    const merged = mergeRailResults(prev, {
      catalog_picks: [],
      suppliers: [{ name: 'Filtered Co' }],
    })
    expect(merged?.catalog_picks[0].handle).toBe('keep')
    expect(merged?.suppliers[0].name).toBe('Filtered Co')
  })
})

describe('latestRailResultsFromMessages', () => {
  it('walks history and merges', () => {
    const got = latestRailResultsFromMessages([
      {
        role: 'assistant',
        result: {
          catalog_picks: [{ handle: 'a', title: 'A' }],
          suppliers: [{ name: 'S1' }],
        },
      },
      {
        role: 'assistant',
        result: { catalog_picks: [], suppliers: [] },
      },
    ])
    expect(got?.catalog_picks[0].handle).toBe('a')
    expect(got?.suppliers[0].name).toBe('S1')
  })
})

describe('SourcingResultsRail', () => {
  it('renders found catalog and supplier cards', () => {
    const html = renderToStaticMarkup(
      createElement(SourcingResultsRail, {
        results: {
          catalog_picks: [{ handle: 'mod-a', title: 'Module A' }],
          suppliers: [{ name: 'Canadian Solar', region: 'Canada' }],
        },
        canvasDoc: null,
        onCanvasChange: () => {},
        onCanvasClose: () => {},
        locale: 'en',
        requirement: 'solar modules',
        sourcingThreadId: 't1',
      })
    )
    expect(html).toContain('Found')
    expect(html).toContain('Module A')
    expect(html).toContain('Canadian Solar')
    expect(html).toContain('On tese.io')
  })

  it('returns null when empty', () => {
    const html = renderToStaticMarkup(
      createElement(SourcingResultsRail, {
        results: null,
        canvasDoc: null,
        onCanvasChange: () => {},
        onCanvasClose: () => {},
        locale: 'en',
        requirement: '',
      })
    )
    expect(html).toBe('')
  })
})

describe('CatalogCard', () => {
  it('links to product handle', () => {
    const html = renderToStaticMarkup(
      createElement(CatalogCard, {
        pick: { handle: 'mod-a', title: 'Module A' },
        locale: 'en',
        requirement: 'solar',
      })
    )
    expect(html).toContain('/en/products/mod-a')
    expect(html).toContain('Module A')
  })
})
