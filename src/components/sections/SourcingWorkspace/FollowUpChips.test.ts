import { describe, expect, it } from 'vitest'

import { normalizeFollowUps } from './FollowUpChips'
import { ComparisonBlock, UiBlockRenderer } from './UiBlocks'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

describe('normalizeFollowUps', () => {
  it('coerces legacy string follow-ups', () => {
    const chips = normalizeFollowUps(['Narrow to India'])
    expect(chips).toHaveLength(1)
    expect(chips[0].prompt).toBe('Narrow to India')
    expect(chips[0].kind).toBe('refine')
  })

  it('keeps typed action chips with intent', () => {
    const chips = normalizeFollowUps([
      {
        label: 'Compare top two',
        prompt: 'Compare the top two suppliers',
        kind: 'action',
        intent: 'compare',
      },
    ])
    expect(chips[0].intent).toBe('compare')
    expect(chips[0].kind).toBe('action')
  })

  it('mixes string and object follow-ups', () => {
    const chips = normalizeFollowUps([
      'Refine to FSC',
      { label: 'Compare', prompt: 'Compare these', kind: 'action', intent: 'compare' },
      { label: '', prompt: '' },
    ])
    expect(chips).toHaveLength(2)
    expect(chips[0].kind).toBe('refine')
    expect(chips[1].intent).toBe('compare')
  })
})

describe('UiBlockRenderer', () => {
  it('renders comparison tables', () => {
    const html = renderToStaticMarkup(
      createElement(UiBlockRenderer, {
        blocks: [{
          type: 'comparison',
          entity: 'supplier',
          title: 'CNC compare',
          columns: ['Criteria', 'Mehta', 'Homag'],
          rows: [
            { cells: ['Lead time', '6 wk', '16 wk'] },
            { cells: ['Service', 'IN', 'Dealer'] },
          ],
        }],
      })
    )
    expect(html).toContain('CNC compare')
    expect(html).toContain('Mehta')
    expect(html).toContain('Lead time')
  })

  it('renders checklist artifact cards', () => {
    const html = renderToStaticMarkup(
      createElement(UiBlockRenderer, {
        blocks: [{
          type: 'checklist',
          title: 'RFQ checklist',
          items: ['Confirm MOQ', 'Ask lead time', 'Verify FSC'],
        }],
      })
    )
    expect(html).toContain('RFQ checklist')
    expect(html).toContain('Confirm MOQ')
  })

  it('ignores unknown block types', () => {
    const html = renderToStaticMarkup(
      createElement(UiBlockRenderer, {
        blocks: [{ type: 'timeline', title: 'RFQ' }],
      })
    )
    expect(html).not.toContain('RFQ')
  })

  it('returns null for empty comparison', () => {
    const html = renderToStaticMarkup(
      createElement(ComparisonBlock, {
        block: { type: 'comparison', columns: ['A'], rows: [] },
      })
    )
    expect(html).toBe('')
  })
})
