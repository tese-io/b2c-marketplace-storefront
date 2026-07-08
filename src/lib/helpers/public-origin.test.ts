import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import { getPublicStorefrontOrigin } from './public-origin'

describe('getPublicStorefrontOrigin', () => {
  it('prefers configured public URL over localhost request origin', () => {
    const prevStorefront = process.env.STOREFRONT_URL
    const prevBase = process.env.NEXT_PUBLIC_BASE_URL
    process.env.STOREFRONT_URL = 'http://148.113.8.184:3000'
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'

    const req = new NextRequest('http://localhost:3000/pl/sso-callback?key=abc')
    expect(getPublicStorefrontOrigin(req)).toBe('http://148.113.8.184:3000')

    process.env.STOREFRONT_URL = prevStorefront
    process.env.NEXT_PUBLIC_BASE_URL = prevBase
  })

  it('uses forwarded host when no configured public URL', () => {
    const prevStorefront = process.env.STOREFRONT_URL
    const prevBase = process.env.NEXT_PUBLIC_BASE_URL
    delete process.env.STOREFRONT_URL
    delete process.env.NEXT_PUBLIC_BASE_URL

    const req = new NextRequest('http://localhost:3000/pl/sso-callback', {
      headers: {
        'x-forwarded-host': '148.113.8.184:3000',
        'x-forwarded-proto': 'http',
      },
    })

    expect(getPublicStorefrontOrigin(req)).toBe('http://148.113.8.184:3000')

    process.env.STOREFRONT_URL = prevStorefront
    process.env.NEXT_PUBLIC_BASE_URL = prevBase
  })
})
