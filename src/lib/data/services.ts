'use server'

import { sdk } from '@/lib/config'
import { getAuthHeaders } from './cookies'
import type { Service, ServiceCategory } from '@/types/services'

export async function listServices(params?: {
  category_id?: string
  service_type?: string
  limit?: number
  offset?: number
  q?: string
}) {
  try {
    const { limit = 12, offset = 0, ...rest } = params || {}

    const response = await sdk.client.fetch<{
      services: Service[]
      count: number
      offset: number
      limit: number
    }>('/store/services', {
      method: 'GET',
      query: { limit, offset, status: 'active', ...rest },
      cache: 'no-cache'
    })

    return response
  } catch (error) {
    console.error('Failed to fetch services:', error)
    return { services: [], count: 0, offset: 0, limit: 12 }
  }
}

export async function getService(id: string) {
  try {
    const response = await sdk.client.fetch<{
      service: Service
    }>(`/store/services/${id}`, {
      method: 'GET',
      cache: 'no-cache'
    })

    return response.service
  } catch (error) {
    console.error('Failed to fetch service:', error)
    return null
  }
}

export async function requestServiceQuote(
  serviceId: string,
  data: {
    title: string
    description: string
    budget_min?: number
    budget_max?: number
    currency_code?: string
    deadline?: string
    requirements?: string
  }
) {
  const headers = await getAuthHeaders()

  const response = await sdk.client.fetch<{
    rfq_request: Record<string, unknown>
  }>(`/store/services/${serviceId}/request-quote`, {
    method: 'POST',
    body: data,
    headers
  })

  return response.rfq_request
}

export async function listServiceCategories() {
  try {
    const response = await sdk.client.fetch<{
      categories: ServiceCategory[]
    }>('/store/services', {
      method: 'GET',
      query: { limit: 100 },
      cache: 'no-cache'
    })

    return response.categories || []
  } catch {
    return []
  }
}
