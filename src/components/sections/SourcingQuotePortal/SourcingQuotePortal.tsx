'use client'

import { useEffect, useState } from 'react'

import type { QuotePortalPayload as PortalPayload } from '@/types/enquiry'

export function SourcingQuotePortal({ token }: { token: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [context, setContext] = useState<PortalPayload['data'] | null>(null)
  const [quotedAmount, setQuotedAmount] = useState('')
  const [quotedCurrency, setQuotedCurrency] = useState('EUR')
  const [quoteNotes, setQuoteNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/storefront/public/quote/${encodeURIComponent(token)}`)
        const json: PortalPayload = await res.json()
        if (cancelled) return
        if (!json?.status || !json.data) {
          setError(json?.msg || 'This quote link is invalid.')
          return
        }
        setContext(json.data)
        if (json.data.alreadySubmitted) {
          setSubmitted(true)
          if (json.data.quotedAmount != null) {
            setQuotedAmount(String(json.data.quotedAmount))
          }
          if (json.data.quotedCurrency) {
            setQuotedCurrency(json.data.quotedCurrency)
          }
          if (json.data.quoteNotes) {
            setQuoteNotes(json.data.quoteNotes)
          }
        }
      } catch {
        if (!cancelled) setError('Could not load this quote request.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || submitted) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/storefront/public/quote/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotedAmount: Number(quotedAmount),
          quotedCurrency,
          quoteNotes,
        }),
      })
      const json: PortalPayload = await res.json()
      if (!json?.status) {
        setError(json?.msg || 'Could not submit quote')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Could not submit quote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center text-secondary">
        Loading quote request…
      </div>
    )
  }

  if (error && !context) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="tese-card p-6 text-center">
          <h1 className="text-lg font-semibold text-primary mb-2">Quote link unavailable</h1>
          <p className="text-secondary text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!context) return null

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="tese-card p-6 flex flex-col gap-4">
        <header>
          <p className="text-[11px] uppercase tracking-wide text-secondary">Tese marketplace RFQ</p>
          <h1 className="text-xl font-semibold text-primary mt-1">{context.title}</h1>
          {context.buyerName && (
            <p className="text-sm text-secondary mt-1">From {context.buyerName}</p>
          )}
        </header>

        {context.productTitle && (
          <p className="text-sm">
            <span className="font-medium text-primary">Product: </span>
            {context.productTitle}
          </p>
        )}

        <div className="rounded-lg bg-tese-surface p-4 text-sm text-secondary whitespace-pre-wrap">
          {context.requirement}
        </div>

        {submitted ? (
          <div className="rounded-lg border border-tese-lime bg-tese-lime-soft p-4 text-sm text-primary">
            <p className="font-semibold">Quote submitted</p>
            <p className="mt-1 text-secondary">
              The buyer can review your quote in their Tese inquiries inbox.
            </p>
            {quotedAmount && (
              <p className="mt-2 font-medium">
                {quotedAmount} {quotedCurrency}
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-primary">Quoted amount</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={quotedAmount}
                  onChange={(e) => setQuotedAmount(e.target.value)}
                  className="rounded-lg border px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-primary">Currency</span>
                <input
                  type="text"
                  maxLength={8}
                  value={quotedCurrency}
                  onChange={(e) => setQuotedCurrency(e.target.value.toUpperCase())}
                  className="rounded-lg border px-3 py-2"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-primary">Notes (lead time, terms, MOQ…)</span>
              <textarea
                rows={4}
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className="rounded-lg border px-3 py-2 resize-y"
              />
            </label>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center items-center rounded-full bg-tese-lime text-tese-ink font-semibold px-5 py-2.5 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit quote'}
            </button>
          </form>
        )}

        <p className="text-[11px] text-secondary">Reference: {context.enquiryId}</p>
      </div>
    </div>
  )
}
