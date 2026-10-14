'use client'

import { useState } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import type { CreateEnquiryInput } from '@/types/enquiry'
import { useTranslations } from 'next-intl'

/**
 * PDP "Request a quote" — creates a real product_page enquiry (RFQ) for this
 * exact product + its seller, instead of just opening the AI sourcing chat.
 * Mirrors the POST /api/storefront/enquiries contract used by SendInquiryButton.
 */
export function RequestQuoteButton({
  productTitle,
  productHandle,
  productId,
  sellerId,
  sellerName,
  sellerEmail,
  isLoggedIn,
}: {
  productTitle: string
  productHandle?: string | null
  productId?: string | null
  sellerId?: string | null
  sellerName?: string
  sellerEmail?: string
  isLoggedIn: boolean
}) {
  const t = useTranslations("product")
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (loading || done) return
    setLoading(true)
    setError(null)

    const parts = [`Requesting a quote for ${productTitle}.`]
    if (quantity.trim()) parts.push(`Quantity: ${quantity.trim()}.`)
    if (note.trim()) parts.push(note.trim())
    const requirement = parts.join(' ')

    const body: CreateEnquiryInput = {
      title: `Quote request: ${productTitle}`.slice(0, 120),
      requirement,
      sourceType: 'product_page',
      productHandle,
      productId,
      productTitle,
      sellerId,
      sellerName,
      sellerEmail,
    }

    try {
      const res = await fetch('/api/storefront/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok || json?.status === false) {
        if (res.status === 401) {
          setError('sign_in')
          return
        }
        setError(json?.msg || 'Could not create your quote request')
        return
      }
      setDone(true)
    } catch {
      setError('Could not create your quote request')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <LocalizedClientLink href="/sourcing/inquiries" className="tese-pdp-btn-primary">
        Quote request sent — track it →
      </LocalizedClientLink>
    )
  }

  if (!isLoggedIn) {
    return (
      <LocalizedClientLink href="/login" className="tese-pdp-btn-primary">
        Sign in to request a quote
      </LocalizedClientLink>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        className="tese-pdp-btn-primary"
        onClick={() => setOpen(true)}
        data-testid="request-quote-button"
      >
        Request a quote
      </button>
    )
  }

  return (
    <div className="tese-pdp-quote-form" data-testid="request-quote-form">
      <label className="tese-pdp-quote-field">
        <span>{t("quantityOptional")}</span>
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="e.g. 25 MT"
          className="tese-pdp-quote-input"
        />
      </label>
      <label className="tese-pdp-quote-field">
        <span>{t("notesOptional")}</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("quotePlaceholder")}
          rows={3}
          className="tese-pdp-quote-input"
        />
      </label>
      <div className="tese-pdp-quote-actions">
        <button
          type="button"
          className="tese-pdp-btn-primary"
          onClick={submit}
          disabled={loading}
          data-testid="request-quote-submit"
        >
          {loading ? 'Sending…' : 'Send request'}
        </button>
        <button
          type="button"
          className="tese-pdp-btn-secondary"
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
      {error && error !== 'sign_in' && (
        <span className="tese-pdp-quote-error">{error}</span>
      )}
    </div>
  )
}
