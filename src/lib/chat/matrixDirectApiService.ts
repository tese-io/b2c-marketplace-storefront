/**
 * Direct Matrix HTTP API for marketplace chat (mirror dashboard pattern).
 * Uses NEXT_PUBLIC_MATRIX_HS_URL and token from store/chat/token.
 */

const MATRIX_HS_URL = (process.env.NEXT_PUBLIC_MATRIX_HS_URL || '').replace(/\/$/, '')

export interface MatrixMessage {
  event_id: string
  sender: string
  origin_server_ts: number
  content: { body: string, msgtype: string }
}

export async function sendTextMessage (
  roomId: string,
  message: string,
  accessToken: string
): Promise<{ event_id: string }> {
  const txnId = `m${Date.now()}.${Math.random().toString(36).substring(2, 15)}`
  const res = await fetch(
    `${MATRIX_HS_URL}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txnId}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ msgtype: 'm.text', body: message })
    }
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || res.statusText)
  }
  return { event_id: (data as { event_id?: string }).event_id || txnId }
}

export async function getRoomMessages (
  roomId: string,
  accessToken: string,
  limit: number = 50
): Promise<MatrixMessage[]> {
  const res = await fetch(
    `${MATRIX_HS_URL}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/messages?limit=${limit}&dir=b`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || res.statusText)
  }
  const chunk = (data as { chunk?: Array<{ type: string, sender: string, event_id: string, origin_server_ts: number, content?: { body?: string, msgtype?: string } }> }).chunk || []
  const messages: MatrixMessage[] = chunk
    .filter((e: { type: string, content?: { msgtype?: string } }) => e.type === 'm.room.message' && e.content?.msgtype === 'm.text')
    .map((e: { event_id: string, sender: string, origin_server_ts: number, content?: { body?: string, msgtype?: string } }) => ({
      event_id: e.event_id,
      sender: e.sender,
      origin_server_ts: e.origin_server_ts,
      content: { body: e.content?.body || '', msgtype: e.content?.msgtype || 'm.text' }
    }))
    .reverse()
  return messages
}

export async function joinRoom (roomId: string, accessToken: string): Promise<void> {
  const res = await fetch(
    `${MATRIX_HS_URL}/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/join`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: '{}'
    }
  )
  if (!res.ok && res.status !== 200) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || res.statusText)
  }
}
