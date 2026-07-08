import type { NextRequest } from 'next/server'

const DEFAULT_PUBLIC_ORIGIN = 'http://148.113.8.184:3000'

function normalizeOrigin (value?: string | null) {
  const trimmed = String(value || '').trim().replace(/\/$/, '')
  return trimmed || null
}

function originFromForwardedHeaders (req: NextRequest) {
  const forwardedHost = req.headers.get('x-forwarded-host')
  if (!forwardedHost) return null

  const host = forwardedHost.split(',')[0]?.trim()
  if (!host) return null

  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'http'
  return `${proto}://${host}`
}

function originFromHostHeader (req: NextRequest) {
  const host = req.headers.get('host')
  if (!host || host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
    return null
  }

  const proto = req.nextUrl.protocol.replace(':', '') || 'http'
  return `${proto}://${host}`
}

/**
 * Canonical browser-facing origin for redirects after SSO.
 * Prefers configured public URL over localhost (SSH tunnel / dev proxy).
 */
export function getPublicStorefrontOrigin (req: NextRequest) {
  const configured = normalizeOrigin(
    process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_BASE_URL
  )

  if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
    return configured
  }

  return (
    originFromForwardedHeaders(req) ||
    originFromHostHeader(req) ||
    configured ||
    normalizeOrigin(req.nextUrl.origin) ||
    DEFAULT_PUBLIC_ORIGIN
  )
}
