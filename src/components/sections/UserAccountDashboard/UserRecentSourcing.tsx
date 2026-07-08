'use client'

import { useCallback, useEffect, useState } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import {
  listSourcingThreads,
  SOURCING_HISTORY_EVENT,
} from '@/lib/sourcing-history'

type RecentThread = { id: string; title: string; updatedAt: number | string }

function formatRelativeTime (ts: number | string): string {
  const ms = typeof ts === 'string' ? Date.parse(ts) : ts
  if (!Number.isFinite(ms)) return ''
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function UserRecentSourcing () {
  const [threads, setThreads] = useState<RecentThread[]>([])

  const refreshThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/sourcing/threads', { cache: 'no-store' })
      if (res.ok) {
        const { threads: server } = await res.json()
        if (Array.isArray(server) && server.length) {
          setThreads(server.slice(0, 5).map((t: { id: string; title: string; updatedAt: number | string }) => ({
            id: t.id,
            title: t.title,
            updatedAt: t.updatedAt,
          })))
          return
        }
      }
    } catch {
      // fall through to localStorage
    }
    setThreads(listSourcingThreads().slice(0, 5))
  }, [])

  useEffect(() => {
    refreshThreads()
    const onEvt = () => refreshThreads()
    window.addEventListener(SOURCING_HISTORY_EVENT, onEvt)
    return () => window.removeEventListener(SOURCING_HISTORY_EVENT, onEvt)
  }, [refreshThreads])

  return (
    <section className="tese-user-dashboard-section" data-testid="user-recent-sourcing">
      <div className="tese-user-dashboard-section-head">
        <h2 className="tese-user-dashboard-section-title">Recent AI searches</h2>
        <LocalizedClientLink href="/sourcing" className="tese-user-dashboard-section-link">
          New search →
        </LocalizedClientLink>
      </div>

      {threads.length > 0 ? (
        <ul className="tese-user-dashboard-list">
          {threads.map((thread) => (
            <li key={thread.id}>
              <LocalizedClientLink
                href={`/sourcing?thread=${thread.id}`}
                className="tese-user-dashboard-list-item"
                title={thread.title}
              >
                <span className="tese-user-dashboard-list-title">{thread.title}</span>
                <span className="tese-user-dashboard-list-meta">
                  {formatRelativeTime(thread.updatedAt)}
                </span>
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      ) : (
        <div className="tese-user-dashboard-empty-panel">
          <p className="tese-user-dashboard-empty-copy">
            Your AI sourcing history will appear here after your first search.
          </p>
          <LocalizedClientLink href="/sourcing" className="tese-sourcing-placeholder-cta">
            Start AI Sourcing
          </LocalizedClientLink>
        </div>
      )}
    </section>
  )
}
