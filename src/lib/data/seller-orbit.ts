import 'server-only'

import {
  storefrontBffFetch,
  type StorefrontBffResponse
} from '@/lib/storefront-bff'

export type SellerOrbitProfile = {
  available: boolean
  profile_handle?: string
  url?: string
  organization?: {
    name?: string | null
    industry?: string | null
    logo?: string | null
  }
}

export async function getSellerOrbitProfile (
  handle: string,
  locale: string
): Promise<SellerOrbitProfile> {
  const { ok, json } = await storefrontBffFetch<SellerOrbitProfile>(
    `/sellers/${encodeURIComponent(handle)}/orbit?locale=${encodeURIComponent(locale)}`
  )

  if (!ok) return { available: false }

  const payload = json as StorefrontBffResponse<SellerOrbitProfile>
  if (payload && typeof payload === 'object' && 'data' in payload && payload.data) {
    return payload.data
  }

  return { available: false }
}
