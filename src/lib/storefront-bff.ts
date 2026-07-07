import 'server-only'

import { getAuthHeaders } from '@/lib/data/cookies'

const TESE_BACKEND_URL = (
  process.env.TESE_BACKEND_URL ||
  process.env.NEXT_PUBLIC_TESE_API_URL ||
  'http://localhost:8000'
).replace(/\/$/, '')

const STOREFRONT_BFF_KEY = process.env.STOREFRONT_BFF_API_KEY || ''

export type StorefrontBffResponse<T> = {
  status: boolean
  data: T
  error?: unknown
  msg: string
}

export async function storefrontBffFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<{ ok: boolean; status: number; json: T | StorefrontBffResponse<T> }> {
  const authHeaders = await getAuthHeaders()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(STOREFRONT_BFF_KEY ? { 'X-Storefront-Bff-Key': STOREFRONT_BFF_KEY } : {}),
    ...(init.headers as Record<string, string> | undefined),
  }

  if ('authorization' in authHeaders && authHeaders.authorization) {
    headers.Authorization = authHeaders.authorization
  }

  const res = await fetch(`${TESE_BACKEND_URL}/api/v3/storefront${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  })

  const json = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, json: json as T }
}

export async function proxySourcingSearch(body: {
  query?: string
  chat_history?: { role: string; content: string }[]
  thread_id?: string
}) {
  const { ok, json } = await storefrontBffFetch<Record<string, unknown>>(
    '/sourcing/search',
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  )

  if (!ok && json && typeof json === 'object' && 'status' in json && json.status === false) {
    return {
      status: 'error',
      answer: 'The sourcing assistant could not complete this request.',
      suppliers: [],
      catalog_picks: [],
      follow_ups: [],
      meta: {},
    }
  }

  return json
}

export async function proxyListSourcingThreads() {
  return storefrontBffFetch('/sourcing/threads', { method: 'GET' })
}

export async function proxyGetSourcingThread(id: string) {
  return storefrontBffFetch(`/sourcing/threads/${encodeURIComponent(id)}`, { method: 'GET' })
}

export async function proxyDeleteSourcingThread(id: string) {
  return storefrontBffFetch(`/sourcing/threads/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
