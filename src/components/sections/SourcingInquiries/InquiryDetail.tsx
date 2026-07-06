'use client'

import { useEffect, useState } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ChatDrawer } from '@/components/organisms/Chat/ChatDrawer'
import { convertToLocale } from '@/lib/helpers/money'
import {
  enquiryStatusLabel,
  type Enquiry,
  type EnquiryDetailPayload,
  type EnquiryTarget,
} from '@/types/enquiry'

export function InquiryDetail({ enquiryId }: { enquiryId: string }) {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [chatTarget, setChatTarget] = useState<EnquiryTarget | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/storefront/enquiries/${enquiryId}`)
        const json: EnquiryDetailPayload = await res.json()
        if (cancelled) return
        if (res.status === 401 || json?.msg === 'Sign in to continue') {
          setNeedsAuth(true)
          return
        }
        if (!json?.status || !json?.data) {
          setError(json?.msg || 'Inquiry not found')
          return
        }
        setEnquiry(json.data)
      } catch {
        if (!cancelled) setError('Could not load inquiry')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [enquiryId])

  async function acceptQuote(targetId: string) {
    setAccepting(targetId)
    setError(null)
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

  const backLink = (
    <LocalizedClientLink
      href="/sourcing/inquiries"
      className="text-sm text-secondary hover:text-primary"
    >
      ← Inquiries
    </LocalizedClientLink>
  )

  if (loading) {
    return (
      <div className="tese-sourcing-loading" role="status">
        Loading inquiry…
      </div>
    )
  }

  if (needsAuth) {
    return (
      <div className="tese-sourcing-placeholder">
        <h1 className="tese-sourcing-placeholder-title">
          Sign in to view this inquiry
        </h1>
        <LocalizedClientLink
          href="/login"
          className="tese-sourcing-placeholder-cta"
        >
          Sign in
        </LocalizedClientLink>
      </div>
    )
  }

  if (error || !enquiry) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4">
        {backLink}
        <p className="mt-4 text-secondary">{error || 'Inquiry not found'}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4" data-testid="inquiry-detail">
      {backLink}

      <header className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold text-primary">{enquiry.title}</h1>
        <span className="tese-sourcing-inquiry-status shrink-0">
          {enquiryStatusLabel(enquiry.status)}
        </span>
      </header>

      <p className="mt-2 whitespace-pre-wrap text-sm text-secondary">
        {enquiry.requirement}
      </p>
      <time
        className="mt-1 block text-[11px] text-secondary"
        dateTime={enquiry.createdAt}
      >
        {new Date(enquiry.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </time>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-primary">Quotes</h2>
      <ul className="flex flex-col gap-3">
        {(enquiry.targets || []).map((t) => {
          const targetId = t._id
          const quoted = t.status === 'quoted'
          return (
            <li
              key={targetId || `${t.productHandle}-${t.sellerId}`}
              className="rounded-sm border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-primary">
                    {t.sellerName || 'Supplier'}
                  </p>
                  {t.productTitle && (
                    <p className="truncate text-[13px] text-secondary">
                      {t.productTitle}
                    </p>
                  )}
                </div>
                <span className="tese-sourcing-inquiry-status shrink-0">
                  {enquiryStatusLabel(t.status || '')}
                </span>
              </div>

              {quoted && typeof t.quotedAmount === 'number' && (
                <p className="mt-2 text-lg font-semibold text-primary">
                  {convertToLocale({
                    amount: t.quotedAmount,
                    currency_code: (t.quotedCurrency || 'EUR').toLowerCase(),
                  })}
                </p>
              )}
              {t.quoteNotes && (
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-secondary">
                  {t.quoteNotes}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!t.sellerId}
                  onClick={() => setChatTarget(t)}
                  className="rounded-sm border px-3 py-1.5 text-sm disabled:opacity-50"
                  data-testid="inquiry-message-seller"
                >
                  Message seller
                </button>
                {quoted && targetId && (
                  <button
                    type="button"
                    disabled={accepting === targetId}
                    onClick={() => acceptQuote(targetId)}
                    className="bg-action text-action-on-primary rounded-sm px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {accepting === targetId ? 'Adding…' : 'Accept → cart'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <ChatDrawer
        open={!!chatTarget?.sellerId}
        onClose={() => setChatTarget(null)}
        seller_id={chatTarget?.sellerId || ''}
        context_id={chatTarget?.productId || undefined}
        subject={chatTarget?.productTitle || enquiry.title}
      />
    </div>
  )
}
