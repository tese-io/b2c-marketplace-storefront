'use server'

import { sdk } from '@/lib/config'
import { getAuthHeaders } from './cookies'
import type { RfqRequest, QuotationVersion, NegotiationThread, NegotiationMessage } from '@/types/rfq'

/* ---- RFQ Requests ---- */

export async function listRfqRequests(params?: {
  status?: string
  limit?: number
  offset?: number
}) {
  const headers = await getAuthHeaders()
  const { limit = 20, offset = 0, ...rest } = params || {}

  try {
    const response = await sdk.client.fetch<{
      rfq_requests: RfqRequest[]
      count: number
      offset: number
      limit: number
    }>('/store/rfq', {
      method: 'GET',
      query: { limit, offset, ...rest },
      headers,
      cache: 'no-cache'
    })

    return response
  } catch (error) {
    console.error('Failed to fetch RFQ requests:', error)
    return { rfq_requests: [], count: 0, offset: 0, limit: 20 }
  }
}

export async function getRfqRequest(id: string) {
  const headers = await getAuthHeaders()

  try {
    const response = await sdk.client.fetch<{
      rfq_request: RfqRequest
    }>(`/store/rfq/${id}`, {
      method: 'GET',
      headers,
      cache: 'no-cache'
    })

    return response.rfq_request
  } catch (error) {
    console.error('Failed to fetch RFQ request:', error)
    return null
  }
}

export async function createRfqRequest(data: {
  title: string
  description: string
  rfq_type: string
  priority?: string
  budget_min?: number
  budget_max?: number
  currency_code?: string
  quantity?: number
  unit?: string
  deadline?: string
  requirements?: string
}) {
  const headers = await getAuthHeaders()

  const response = await sdk.client.fetch<{
    rfq_request: RfqRequest
  }>('/store/rfq', {
    method: 'POST',
    body: data,
    headers
  })

  return response.rfq_request
}

export async function updateRfqRequest(
  id: string,
  data: Partial<{
    title: string
    description: string
    priority: string
    budget_min: number
    budget_max: number
    deadline: string
    requirements: string
  }>
) {
  const headers = await getAuthHeaders()

  const response = await sdk.client.fetch<{
    rfq_request: RfqRequest
  }>(`/store/rfq/${id}`, {
    method: 'PATCH',
    body: data,
    headers
  })

  return response.rfq_request
}

export async function acceptQuote(rfqId: string, quotationVersionId: string) {
  const headers = await getAuthHeaders()

  const response = await sdk.client.fetch<{
    rfq_request: RfqRequest
    quotation_version: QuotationVersion
  }>(`/store/rfq/${rfqId}/accept-quote`, {
    method: 'POST',
    body: { quotation_version_id: quotationVersionId },
    headers
  })

  return response
}

/* ---- Quotations ---- */

export async function listQuotations(params?: {
  status?: string
  limit?: number
  offset?: number
}) {
  const headers = await getAuthHeaders()
  const { limit = 20, offset = 0, ...rest } = params || {}

  try {
    const response = await sdk.client.fetch<{
      quotations: QuotationVersion[]
      count: number
      offset: number
      limit: number
    }>('/store/quotations', {
      method: 'GET',
      query: { limit, offset, ...rest },
      headers,
      cache: 'no-cache'
    })

    return response
  } catch (error) {
    console.error('Failed to fetch quotations:', error)
    return { quotations: [], count: 0, offset: 0, limit: 20 }
  }
}

export async function getQuotation(id: string) {
  const headers = await getAuthHeaders()

  try {
    const response = await sdk.client.fetch<{
      quotation: QuotationVersion
    }>(`/store/quotations/${id}`, {
      method: 'GET',
      headers,
      cache: 'no-cache'
    })

    return response.quotation
  } catch (error) {
    console.error('Failed to fetch quotation:', error)
    return null
  }
}

export async function negotiateQuotation(
  id: string,
  data: {
    proposed_amount: number
    notes?: string
    line_items?: Array<{
      description: string
      quantity: number
      unit_price: number
    }>
  }
) {
  const headers = await getAuthHeaders()

  const response = await sdk.client.fetch<{
    quotation: QuotationVersion
  }>(`/store/quotations/${id}/negotiate`, {
    method: 'POST',
    body: data,
    headers
  })

  return response.quotation
}

export async function convertQuotationToOrder(id: string) {
  const headers = await getAuthHeaders()

  const response = await sdk.client.fetch<{
    order: Record<string, unknown>
  }>(`/store/quotations/${id}/convert-to-order`, {
    method: 'POST',
    headers
  })

  return response.order
}

/* ---- Negotiations ---- */

export async function listNegotiations(params?: {
  status?: string
  limit?: number
  offset?: number
}) {
  const headers = await getAuthHeaders()
  const { limit = 20, offset = 0, ...rest } = params || {}

  try {
    const response = await sdk.client.fetch<{
      negotiations: NegotiationThread[]
      count: number
      offset: number
      limit: number
    }>('/store/negotiations', {
      method: 'GET',
      query: { limit, offset, ...rest },
      headers,
      cache: 'no-cache'
    })

    return response
  } catch (error) {
    console.error('Failed to fetch negotiations:', error)
    return { negotiations: [], count: 0, offset: 0, limit: 20 }
  }
}

export async function getNegotiation(id: string) {
  const headers = await getAuthHeaders()

  try {
    const response = await sdk.client.fetch<{
      negotiation: NegotiationThread
    }>(`/store/negotiations/${id}`, {
      method: 'GET',
      headers,
      cache: 'no-cache'
    })

    return response.negotiation
  } catch (error) {
    console.error('Failed to fetch negotiation:', error)
    return null
  }
}

export async function getNegotiationMessages(
  id: string,
  params?: { limit?: number; offset?: number }
) {
  const headers = await getAuthHeaders()

  try {
    const response = await sdk.client.fetch<{
      messages: NegotiationMessage[]
      count: number
    }>(`/store/negotiations/${id}/messages`, {
      method: 'GET',
      query: params,
      headers,
      cache: 'no-cache'
    })

    return response
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return { messages: [], count: 0 }
  }
}

export async function sendNegotiationMessage(
  id: string,
  data: {
    content: string
    message_type?: string
    proposal_data?: Record<string, unknown>
  }
) {
  const headers = await getAuthHeaders()

  const response = await sdk.client.fetch<{
    message: NegotiationMessage
  }>(`/store/negotiations/${id}/messages`, {
    method: 'POST',
    body: data,
    headers
  })

  return response.message
}
