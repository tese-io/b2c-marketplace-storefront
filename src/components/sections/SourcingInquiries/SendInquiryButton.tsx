'use client'

import { useState } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

type EnquiryTarget = {
  productHandle?: string | null
  productId?: string | null
  productTitle?: string
  sellerId?: string | null
  sellerName?: string
  sellerEmail?: string
}

type SendInquiryButtonProps = {
  requirement: string
  title?: string
  target?: EnquiryTarget
  sourcingThreadId?: string | null
  className?: string
  label?: string
}

export function SendInquiryButton({
  requirement,
  title,
  target,
  sourcingThreadId,
  className = '',
  label = 'Send inquiry',
}: SendInquiryButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (loading || done) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/storefront/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || requirement.slice(0, 120),
          requirement,
          sourceType: 'ai_sourcing',
          sourcingThreadId,
          productHandle: target?.productHandle,
          productId: target?.productId,
          productTitle: target?.productTitle,
          sellerId: target?.sellerId,
          sellerName: target?.sellerName,
          sellerEmail: target?.sellerEmail,
        }),
      })
      const json = await res.json()

      if (!res.ok || json?.status === false) {
        if (res.status === 401) {
          setError('sign_in')
          return
        }
        setError(json?.msg || 'Could not create inquiry')
        return
      }

      setDone(true)
    } catch {
      setError('Could not create inquiry')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <LocalizedClientLink
        href="/sourcing/inquiries"
        className={`inline-flex items-center text-[12px] font-medium text-tese-ice hover:underline ${className}`}
      >
        Inquiry saved — view in Inquiries →
      </LocalizedClientLink>
    )
  }

  if (error === 'sign_in') {
    return (
      <LocalizedClientLink
        href="/login"
        className={`inline-flex items-center text-[12px] font-medium text-tese-ink bg-tese-lime rounded-full px-3 py-1 ${className}`}
      >
        Sign in to send inquiry
      </LocalizedClientLink>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleSend}
        disabled={loading}
        className={`inline-flex items-center text-[12px] font-medium text-tese-ink bg-tese-lime rounded-full px-3 py-1 disabled:opacity-50 cursor-pointer ${className}`}
      >
        {loading ? 'Sending…' : label}
      </button>
      {error && error !== 'sign_in' && (
        <span className="text-[11px] text-red-600">{error}</span>
      )}
    </div>
  )
}
