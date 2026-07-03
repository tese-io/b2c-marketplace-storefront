import { describe, expect, it } from 'vitest'

import { looksLikeHtml, sanitizeProductHtml } from './html'

describe('looksLikeHtml', () => {
  it('detects markup', () => {
    expect(looksLikeHtml('<p>hi</p>')).toBe(true)
    expect(looksLikeHtml('plain text, no tags')).toBe(false)
    expect(looksLikeHtml('a < b and c > d')).toBe(false)
  })
})

describe('sanitizeProductHtml', () => {
  it('keeps safe formatting tags and https links', () => {
    const out = sanitizeProductHtml(
      '<p>Audits <a href="https://beta.qima.com/x">Ethical</a></p>'
    )
    expect(out).toContain('<p>')
    expect(out).toContain('href="https://beta.qima.com/x"')
    expect(out).toContain('Ethical')
  })

  it('forces external links to open safely', () => {
    const out = sanitizeProductHtml('<a href="https://x.com">x</a>')
    expect(out).toContain('rel="noopener noreferrer nofollow"')
    expect(out).toContain('target="_blank"')
  })

  it('strips scripts, event handlers and dangerous URL schemes', () => {
    const out = sanitizeProductHtml(
      '<p onclick="steal()">hi</p><img src=x onerror=alert(1)>' +
        '<script>alert(1)</script><a href="javascript:alert(1)">bad</a>'
    )
    expect(out).not.toContain('script')
    expect(out).not.toContain('onclick')
    expect(out).not.toContain('onerror')
    expect(out).not.toContain('javascript:')
    expect(out).not.toContain('<img')
    // link text is preserved even when its href is dropped
    expect(out).toContain('bad')
  })
})
