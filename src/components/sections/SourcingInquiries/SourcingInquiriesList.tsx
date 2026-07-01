'use client'

import { useEffect, useState } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

type EnquiryTarget = {
  _id?: string
  sellerId?: string | null
  sellerName?: string
  productHandle?: string | null
  productTitle?: string
  status?: string
  quotedAmount?: number | null
  quotedCurrency?: string
}

type Enquiry = {
  enquiryId: string
  title: string
  requirement: string
  status: string
  createdAt: string
  targets?: EnquiryTarget[]
}

type ListPayload = {
  status: boolean
  data?: {
    items: Enquiry[]
    pagination?: { total: number }
  }
  msg?: string
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: 'Draft',
    open: 'Open',
    quoted: 'Quoted',
    accepted: 'Accepted',
    closed: 'Closed',
    cancelled: 'Cancelled',
  }
  return map[status] || status
}

export function SourcingInquiriesList() {
  const [items, setItems] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/storefront/enquiries')
        const json: ListPayload = await res.json()
        if (cancelled) return

        if (res.status === 401 || json?.msg === 'Sign in to continue') {
          setNeedsAuth(true)
          setItems([])
          return
        }

        if (!json?.status) {
          setError(json?.msg || 'Could not load inquiries')
          setItems([])
          return
        }

        setItems(json.data?.items || [])
      } catch {
        if (!cancelled) setError('Could not load inquiries')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function sendRfq(enquiryId: string) {
    setSending(enquiryId)
    setError(null)
    try {
      const res = await fetch(`/api/storefront/enquiries/${enquiryId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const json = await res.json()
      if (!json?.status) {
        setError(json?.msg || 'Could not send RFQ')
        return
      }
      const listRes = await fetch('/api/storefront/enquiries')
      const listJson: ListPayload = await listRes.json()
      if (listJson?.status) {
        setItems(listJson.data?.items || [])
      }
    } catch {
      setError('Could not send RFQ')
    } finally {
      setSending(null)
    }
  }

  async function acceptQuote(enquiryId: string, targetId: string) {
    setAccepting(`${enquiryId}:${targetId}`)
    try {
      const res = await fetch(`/api/storefront/enquiries/${enquiryId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId }),
      })
      const json = await res.json()
      if (json?.status && json?.data?.checkoutPath) {
        window.location.href = json.data.checkoutPath
        return
      }
      setError(json?.msg || 'Could not accept quote')
    } catch {
      setError('Could not accept quote')
    } finally {
      setAccepting(null)
    }
  }

  if (loading) {
    return (
      <div className="tese-sourcing-loading" role="status">
        Loading inquiries…
      </div>
    )
  }

  if (needsAuth) {
    return (
      <div className="tese-sourcing-placeholder">
        <div className="tese-sourcing-placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
            <rect x="14" y="8" width="36" height="48" rx="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 20h20M22 28h20M22 36h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="tese-sourcing-placeholder-title">Sign in to view inquiries</h1>
        <p className="tese-sourcing-placeholder-desc">
          Save RFQs from AI sourcing and track supplier responses in one place.
        </p>
        <LocalizedClientLink href="/login" className="tese-sourcing-placeholder-cta">
          Sign in
        </LocalizedClientLink>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="tese-sourcing-placeholder">
        <div className="tese-sourcing-placeholder-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
            <rect x="14" y="8" width="36" height="48" rx="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M22 20h20M22 28h20M22 36h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="tese-sourcing-placeholder-title">You haven&apos;t sent any inquiries yet</h1>
        <p className="tese-sourcing-placeholder-desc">
          Send requirements to multiple suppliers at once from AI sourcing results.
        </p>
        <LocalizedClientLink href="/sourcing" className="tese-sourcing-placeholder-cta">
          Start sourcing
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div className="tese-sourcing-inquiries">
      <header className="tese-sourcing-inquiries-head">
        <h1 className="tese-sourcing-inquiries-title">Inquiries</h1>
        <p className="tese-sourcing-inquiries-sub">
          {items.length} saved {items.length === 1 ? 'inquiry' : 'inquiries'}
        </p>
      </header>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">
          {error}
        </p>
      )}

      <ul className="tese-sourcing-inquiries-list">
        {items.map((item) => (
          <li key={item.enquiryId} className="tese-sourcing-inquiry-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-primary truncate">{item.title}</p>
                <p className="text-[13px] text-secondary mt-1 line-clamp-2">{item.requirement}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="tese-sourcing-inquiry-status">{statusLabel(item.status)}</span>
                {!!item.targets?.length &&
                  ['draft', 'open'].includes(item.status) &&
                  item.targets.some((t) => t.status === 'draft' || !t.status) && (
                    <button
                      type="button"
                      disabled={sending === item.enquiryId}
                      onClick={() => sendRfq(item.enquiryId)}
                      className="text-[11px] font-medium text-tese-ink bg-tese-lime rounded-full px-2.5 py-1 disabled:opacity-50"
                    >
                      {sending === item.enquiryId ? 'Sending…' : 'Send RFQ'}
                    </button>
                  )}
              </div>
            </div>

            {!!item.targets?.length && (
              <ul className="mt-3 flex flex-col gap-2">
                {item.targets.map((t) => (
                  <li
                    key={t._id || `${t.productHandle}-${t.sellerId}`}
                    className="text-[12px] text-secondary flex items-center justify-between gap-2 border-t border-black/5 pt-2"
                  >
                    <span className="truncate">
                      {t.productTitle || t.sellerName || t.productHandle || 'Supplier target'}
                      {t.status ? ` · ${statusLabel(t.status)}` : ''}
                    </span>
                    {t._id && t.status === 'quoted' && (
                      <button
                        type="button"
                        disabled={accepting === `${item.enquiryId}:${t._id}`}
                        onClick={() => acceptQuote(item.enquiryId, t._id!)}
                        className="shrink-0 text-[11px] font-medium text-tese-ink bg-tese-lime rounded-full px-2.5 py-1 disabled:opacity-50"
                      >
                        {accepting === `${item.enquiryId}:${t._id}` ? 'Adding…' : 'Accept → cart'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <time className="block mt-3 text-[11px] text-secondary" dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </li>
        ))}
      </ul>
    </div>
  )
}
