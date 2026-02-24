'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getRoomMessages, sendTextMessage, joinRoom, type MatrixMessage } from '@/lib/chat/matrixDirectApiService'

const POLL_INTERVAL_MS = 3000

export function MatrixChatBox ({
  roomId,
  accessToken,
  currentUserId,
  otherName = 'Seller'
}: {
  roomId: string
  accessToken: string
  currentUserId: string
  otherName?: string
}) {
  const [messages, setMessages] = useState<MatrixMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastTsRef = useRef(0)
  const seenRef = useRef<Set<string>>(new Set())
  const mountedRef = useRef(true)

  const loadMessages = useCallback(async () => {
    if (!mountedRef.current) return
    try {
      const list = await getRoomMessages(roomId, accessToken, 50)
      list.forEach((m) => {
        seenRef.current.add(m.event_id)
        lastTsRef.current = Math.max(lastTsRef.current, m.origin_server_ts)
      })
      setMessages((prev) => {
        const byId = new Map(prev.map((m) => [m.event_id, m]))
        list.forEach((m) => byId.set(m.event_id, m))
        return Array.from(byId.values()).sort((a, b) => a.origin_server_ts - b.origin_server_ts)
      })
      setError(null)
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : 'Failed to load messages')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [roomId, accessToken])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!roomId || !accessToken) return
    joinRoom(roomId, accessToken).catch(() => {})
    loadMessages()
  }, [roomId, accessToken, loadMessages])

  useEffect(() => {
    if (!roomId || !accessToken) return
    const t = setInterval(loadMessages, POLL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [roomId, accessToken, loadMessages])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setInput('')
    try {
      await sendTextMessage(roomId, text, accessToken)
      await loadMessages()
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      if (mountedRef.current) setSending(false)
    }
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded border border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-500">Loading chat…</span>
      </div>
    )
  }

  return (
    <div className="flex h-[500px] w-full flex-col rounded border border-gray-200 bg-white">
      {error && (
        <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-3"
      >
        {messages.map((m) => {
          const isMe = m.sender === currentUserId
          return (
            <div
              key={m.event_id}
              className={`mb-2 ${isMe ? 'text-right' : ''}`}
            >
              <span
                className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  isMe ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {m.content.body}
              </span>
              <div className={`mt-0.5 text-xs text-gray-500 ${isMe ? 'text-right' : ''}`}>
                {isMe ? 'You' : otherName} · {new Date(m.origin_server_ts).toLocaleTimeString()}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex border-t border-gray-200 p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message…"
          className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="ml-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
