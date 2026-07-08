'use server'

import { storefrontBffFetch } from '@/lib/storefront-bff'
import type { Enquiry, EnquiryListPayload } from '@/types/enquiry'

export async function listEnquiries (): Promise<Enquiry[]> {
  const { ok, json } = await storefrontBffFetch<EnquiryListPayload>('/enquiries', {
    method: 'GET',
  })

  if (!ok || !json?.status) {
    return []
  }

  return json.data?.items || []
}
