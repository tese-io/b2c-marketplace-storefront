'use server'

import { getAuthHeaders } from './cookies'

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'

async function chatFetch (path: string, options: { method: string, body?: Record<string, unknown> } = { method: 'GET' }) {
  const headers = await getAuthHeaders()
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
      ...headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false as const, data: null, error: (data as { message?: string }).message || res.statusText }
  }
  return { ok: true as const, data, error: null }
}

export async function getMatrixToken () {
  const result = await chatFetch('/store/chat/token', { method: 'POST' })
  if (!result.ok || !result.data) return null
  const d = result.data as { access_token?: string, user_id?: string }
  return d.access_token && d.user_id ? { access_token: d.access_token, user_id: d.user_id } : null
}

export async function getChatRoom (params: { product_id?: string, seller_id: string, order_id?: string, room_name?: string }) {
  const result = await chatFetch('/store/chat/room', { method: 'POST', body: params })
  if (!result.ok || !result.data) return null
  const d = result.data as { room_id?: string }
  return d.room_id ? { room_id: d.room_id } : null
}

export async function getChatRooms () {
  const result = await chatFetch('/store/chat/rooms', { method: 'GET' })
  if (!result.ok || !result.data) return []
  const d = result.data as { rooms?: Array<{ room_id: string, name: string, seller_id: string }> }
  return d.rooms || []
}
