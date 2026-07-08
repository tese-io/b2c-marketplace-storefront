import { describe, expect, it } from 'vitest'

import {
  getContinueWithTeseUrl,
  getDashboardUrl,
  getManageAccountUrl,
  getTeseSignupUrl,
} from './tese-auth-urls'

describe('tese-auth-urls', () => {
  it('builds marketplace enter URL with path and locale', () => {
    const url = getContinueWithTeseUrl('/sourcing', 'en')
    expect(url).toContain('/marketplace/enter?')
    expect(url).toContain('path=%2Fsourcing')
    expect(url).toContain('locale=en')
  })

  it('builds signup URL with redirect back to marketplace enter', () => {
    const url = getTeseSignupUrl('/user', 'pl')
    const parsed = new URL(url)
    expect(parsed.pathname).toBe('/sign-up')
    const redirect = decodeURIComponent(parsed.searchParams.get('redirect') || '')
    expect(redirect).toContain('/marketplace/enter')
    expect(redirect).toContain('path=/user')
    expect(redirect).toContain('locale=pl')
  })

  it('strips trailing slash from dashboard URL', () => {
    const prev = process.env.NEXT_PUBLIC_TESE_DASHBOARD_URL
    process.env.NEXT_PUBLIC_TESE_DASHBOARD_URL = 'https://app.tese.io/'
    expect(getDashboardUrl()).toBe('https://app.tese.io')
    process.env.NEXT_PUBLIC_TESE_DASHBOARD_URL = prev
  })

  it('returns dashboard URL for manage account link', () => {
    const prev = process.env.NEXT_PUBLIC_TESE_DASHBOARD_URL
    process.env.NEXT_PUBLIC_TESE_DASHBOARD_URL = 'https://app.tese.io'
    expect(getManageAccountUrl()).toBe('https://app.tese.io')
    process.env.NEXT_PUBLIC_TESE_DASHBOARD_URL = prev
  })
})
