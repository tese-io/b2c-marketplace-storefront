export type StoredMessage =
  | { role: 'user'; content: string }
  | {
      role: 'assistant'
      content: string
      result?: Record<string, unknown>
      pending?: boolean
      error?: boolean
    }

export type SourcingThread = {
  id: string
  title: string
  messages: StoredMessage[]
  updatedAt: number
  createdAt: number
}

const STORAGE_KEY = 'tese-sourcing-threads'
const MAX_THREADS = 30
export const SOURCING_HISTORY_EVENT = 'tese-sourcing-history-updated'

function readAll (): SourcingThread[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SourcingThread[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll (threads: SourcingThread[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
  window.dispatchEvent(new CustomEvent(SOURCING_HISTORY_EVENT))
}

export function listSourcingThreads (): SourcingThread[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getSourcingThread (id: string): SourcingThread | null {
  return readAll().find((t) => t.id === id) ?? null
}

function createId (): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // HTTP (non-secure) contexts may not expose randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8
    return value.toString(16)
  })
}

export function createSourcingThreadId (): string {
  return createId()
}

export function upsertSourcingThread (thread: SourcingThread) {
  const threads = readAll().filter((t) => t.id !== thread.id)
  threads.unshift(thread)
  writeAll(threads.slice(0, MAX_THREADS))
}

export function deleteSourcingThread (id: string) {
  writeAll(readAll().filter((t) => t.id !== id))
}

export function titleFromQuery (query: string): string {
  const trimmed = query.trim()
  if (trimmed.length <= 48) return trimmed
  return `${trimmed.slice(0, 45)}…`
}
