'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ChatDrawer } from '@/components/organisms/Chat/ChatDrawer'
import { InquiryProductStrip } from '@/components/sections/SourcingInquiries/InquiryProductStrip'
import { listProducts } from '@/lib/data/products'
import { convertToLocale } from '@/lib/helpers/money'
import {
  buildProductMetaPills,
  buildRequirementPills,
  fallbackProductSummary,
  primaryProductHandle,
  productSummaryFromMedusa,
  uniqueProductHandles,
  type InquiryProductSummary,
} from '@/lib/helpers/inquiry-product'
import {
  enquiryStatusLabel,
  type Enquiry,
  type EnquiryDetailPayload,
  type EnquiryTarget,
} from '@/types/enquiry'

function initials (name?: string) {
  if (!name) return '?'
  const words = name.replace(/[^\p{L}\p{N} ]/gu, '').split(' ').filter(Boolean)
  if (words.length === 0) return name.slice(0, 1).toUpperCase()
  return words.slice(0, 2).map(w => w[0]!.toUpperCase()).join('')
}

function statusModifier (status: string) {
  const value = status.toLowerCase()
  if (value === 'open' || value === 'sent') return 'is-open'
  if (value === 'quoted') return 'is-quoted'
  if (value === 'accepted') return 'is-accepted'
  if (value === 'draft') return 'is-draft'
  if (value === 'declined' || value === 'cancelled' || value === 'closed') {
    return 'is-muted'
  }
  return 'is-neutral'
}

function StatusBadge ({ status }: { status: string }) {
  return (
    <span className={`tese-inquiry-status ${statusModifier(status)}`}>
      {enquiryStatusLabel(status)}
    </span>
  )
}

function InquiryDetailSkeleton () {
  return (
    <div className="tese-inquiry-detail" aria-hidden>
      <div className="tese-inquiry-detail-skeleton-back" />
      <div className="tese-inquiry-detail-skeleton-hero">
        <div className="tese-inquiry-detail-skeleton-line tese-inquiry-detail-skeleton-line--title" />
        <div className="tese-inquiry-detail-skeleton-line" />
        <div className="tese-inquiry-detail-skeleton-line tese-inquiry-detail-skeleton-line--short" />
      </div>
      <div className="tese-inquiry-detail-skeleton-quote" />
    </div>
  )
}

export function InquiryDetail ({ enquiryId }: { enquiryId: string }) {
  const params = useParams()
  const countryCode = typeof params.locale === 'string' ? params.locale : 'en'

  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [chatTarget, setChatTarget] = useState<EnquiryTarget | null>(null)
  const [productsByHandle, setProductsByHandle] = useState<
    Map<string, InquiryProductSummary>
  >(new Map())
  const [productsLoading, setProductsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load () {
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

  useEffect(() => {
    if (!enquiry) return
    const handles = uniqueProductHandles(enquiry.targets)
    if (!handles.length) {
      setProductsByHandle(new Map())
      setProductsLoading(false)
      return
    }

    let cancelled = false
    async function loadProducts () {
      setProductsLoading(true)
      try {
        const entries = await Promise.all(
          handles.map(async (handle) => {
            try {
              const { response } = await listProducts({
                countryCode,
                queryParams: { handle: [handle], limit: 1 },
              })
              const product = response.products[0]
              if (!product) return null
              return [handle, productSummaryFromMedusa(product)] as const
            } catch {
              return null
            }
          })
        )
        if (cancelled) return
        const map = new Map<string, InquiryProductSummary>()
        for (const entry of entries) {
          if (entry) map.set(entry[0], entry[1])
        }
        setProductsByHandle(map)
      } finally {
        if (!cancelled) setProductsLoading(false)
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [enquiry, countryCode])

  async function acceptQuote (targetId: string) {
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

  const primaryHandle = useMemo(
    () => primaryProductHandle(enquiry?.targets),
    [enquiry?.targets]
  )

  const primaryTarget = useMemo(() => {
    if (!primaryHandle) return undefined
    return enquiry?.targets?.find(t => t.productHandle?.trim() === primaryHandle)
  }, [enquiry?.targets, primaryHandle])

  const primaryProduct = useMemo(() => {
    if (!primaryHandle) return null
    return (
      productsByHandle.get(primaryHandle) ||
      fallbackProductSummary(primaryHandle, primaryTarget)
    )
  }, [primaryHandle, primaryTarget, productsByHandle])

  const productMetaPills = useMemo(
    () => buildProductMetaPills(primaryProduct?.metadata),
    [primaryProduct?.metadata]
  )

  const requirementPills = useMemo(
    () =>
      buildRequirementPills(
        enquiry?.structuredRequirement,
        enquiry?.requirement || '',
        primaryProduct?.metadata
      ),
    [enquiry?.structuredRequirement, enquiry?.requirement, primaryProduct?.metadata]
  )

  const backLink = (
    <LocalizedClientLink
      href="/sourcing/inquiries"
      className="tese-inquiry-detail-back"
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Inquiries
    </LocalizedClientLink>
  )

  if (loading) {
    return (
      <div role="status" aria-label="Loading inquiry">
        <InquiryDetailSkeleton />
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

  if (error && !enquiry) {
    return (
      <div className="tese-inquiry-detail">
        {backLink}
        <div className="tese-inquiry-detail-empty">
          <p className="tese-inquiry-detail-empty-title">
            {error || 'Inquiry not found'}
          </p>
          <LocalizedClientLink
            href="/sourcing/inquiries"
            className="tese-inquiry-btn-secondary"
          >
            Back to inquiries
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  if (!enquiry) return null

  const targets = enquiry.targets || []
  const showProductStrip = Boolean(primaryHandle && primaryProduct)

  return (
    <div className="tese-inquiry-detail" data-testid="inquiry-detail">
      <nav className="tese-inquiry-detail-nav">{backLink}</nav>

      <article
        className={`tese-inquiry-detail-hero${
          showProductStrip ? ' tese-inquiry-detail-hero--with-product' : ''
        }`}
      >
        {showProductStrip ? (
          <>
            <InquiryProductStrip
              product={primaryProduct}
              loading={productsLoading}
              productMetaPills={productMetaPills}
              requirementPills={requirementPills}
              statusBadge={<StatusBadge status={enquiry.status} />}
              productHref={`/products/${primaryHandle}`}
            />
            <div className="tese-inquiry-detail-request">
              <p className="tese-inquiry-detail-requirement">{enquiry.requirement}</p>
              <time
                className="tese-inquiry-detail-date"
                dateTime={enquiry.createdAt}
              >
                {new Date(enquiry.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </div>
          </>
        ) : (
          <>
            <header className="tese-inquiry-detail-head">
              <h1 className="tese-inquiry-detail-title">{enquiry.title}</h1>
              <StatusBadge status={enquiry.status} />
            </header>
            <p className="tese-inquiry-detail-requirement">{enquiry.requirement}</p>
            <time
              className="tese-inquiry-detail-date"
              dateTime={enquiry.createdAt}
            >
              {new Date(enquiry.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </>
        )}
      </article>

      <section className="tese-inquiry-detail-quotes" aria-labelledby="inquiry-quotes-heading">
        <div className="tese-inquiry-detail-quotes-head">
          <h2 id="inquiry-quotes-heading" className="tese-inquiry-detail-quotes-title">
            Quotes
          </h2>
          {targets.length > 0 ? (
            <span className="tese-inquiry-detail-quotes-count">
              {targets.length} supplier{targets.length === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>

        {targets.length === 0 ? (
          <div className="tese-inquiry-detail-no-quotes">
            <p>No supplier responses yet.</p>
            <p className="tese-inquiry-detail-no-quotes-hint">
              Quotes will appear here once sellers respond to your request.
            </p>
          </div>
        ) : (
          <ul className="tese-inquiry-detail-quotes-list">
            {targets.map((t) => {
              const targetId = t._id
              const quoted = t.status === 'quoted'
              const sellerLabel = t.sellerName || 'Supplier'
              const handle = t.productHandle?.trim()
              const quoteThumb =
                handle &&
                handle !== primaryHandle &&
                productsByHandle.get(handle)?.thumbnail

              return (
                <li
                  key={targetId || `${t.productHandle}-${t.sellerId}`}
                  className="tese-inquiry-quote-card"
                >
                  <div className="tese-inquiry-quote-head">
                    <span className="tese-inquiry-quote-avatar" aria-hidden>
                      {initials(sellerLabel)}
                    </span>
                    <div className="tese-inquiry-quote-meta">
                      <p className="tese-inquiry-quote-seller">{sellerLabel}</p>
                      {t.productTitle ? (
                        <p className="tese-inquiry-quote-product-row">
                          {quoteThumb ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={quoteThumb}
                              alt=""
                              className="tese-inquiry-quote-product-thumb"
                              loading="lazy"
                              width={40}
                              height={40}
                            />
                          ) : null}
                          <span className="tese-inquiry-quote-product">
                            {t.productTitle}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge status={t.status || ''} />
                  </div>

                  {quoted && typeof t.quotedAmount === 'number' ? (
                    <div className="tese-inquiry-quote-price">
                      <span className="tese-inquiry-quote-price-label">Quoted price</span>
                      <span className="tese-inquiry-quote-price-value">
                        {convertToLocale({
                          amount: t.quotedAmount,
                          currency_code: (t.quotedCurrency || 'EUR').toLowerCase(),
                        })}
                      </span>
                    </div>
                  ) : null}

                  {t.quoteNotes ? (
                    <blockquote className="tese-inquiry-quote-notes">
                      {t.quoteNotes}
                    </blockquote>
                  ) : null}

                  <div className="tese-inquiry-quote-actions">
                    <button
                      type="button"
                      disabled={!t.sellerId}
                      onClick={() => setChatTarget(t)}
                      className="tese-inquiry-btn-secondary"
                      data-testid="inquiry-message-seller"
                    >
                      Message seller
                    </button>
                    {quoted && targetId ? (
                      <button
                        type="button"
                        disabled={accepting === targetId}
                        onClick={() => acceptQuote(targetId)}
                        className="tese-inquiry-btn-primary"
                      >
                        {accepting === targetId ? 'Adding…' : 'Accept → cart'}
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {error ? (
        <p className="tese-inquiry-detail-error" role="alert">
          {error}
        </p>
      ) : null}

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
