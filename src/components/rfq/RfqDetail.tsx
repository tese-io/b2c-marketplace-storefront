'use client'

import { useState } from 'react'
import { RfqRequest, QuotationVersion, RfqStatus, QuoteStatus } from '@/types/rfq'

interface RfqDetailProps {
  rfq: RfqRequest
}

const STATUS_CONFIG: Record<RfqStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-component-secondary text-secondary' },
  submitted: { label: 'Submitted', className: 'bg-action-ice text-tese-dark' },
  quoting: { label: 'Quoting', className: 'bg-accent text-tese-dark' },
  quoted: { label: 'Quoted', className: 'bg-tese-green text-tese-dark' },
  in_negotiation: { label: 'Negotiating', className: 'bg-accent-purple text-white' },
  accepted: { label: 'Accepted', className: 'bg-positive-secondary text-positive' },
  rejected: { label: 'Rejected', className: 'bg-negative-secondary text-negative' },
  expired: { label: 'Expired', className: 'bg-component-secondary text-disabled' },
  converted: { label: 'Converted to Order', className: 'bg-positive text-white' },
}

export function RfqDetail({ rfq }: RfqDetailProps) {
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null)
  const statusCfg = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.draft
  const quotes = rfq.quotation_versions || []

  return (
    <div className="max-w-6xl mx-auto">
      <nav className="text-sm text-secondary mb-6 flex items-center gap-2">
        <a href="/rfq" className="hover:text-action transition-colors">My RFQs</a>
        <span>/</span>
        <span className="text-primary truncate">{rfq.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="heading-xl text-primary">{rfq.title}</h1>
            <span className={`inline-flex px-3 py-1 rounded-xs text-sm font-medium ${statusCfg.className}`}>
              {statusCfg.label}
            </span>
          </div>
          <p className="text-md text-secondary">{rfq.description}</p>
        </div>
      </div>

      {/* RFQ Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {rfq.budget_max && (
          <div className="bg-card border border-primary rounded-sm p-4">
            <p className="text-[11px] text-secondary uppercase tracking-wider mb-1">Budget</p>
            <p className="heading-sm text-primary">
              {rfq.budget_min ? `${(rfq.budget_min / 100).toLocaleString()} - ` : ''}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: rfq.currency_code || 'USD',
                minimumFractionDigits: 0,
              }).format(rfq.budget_max / 100)}
            </p>
          </div>
        )}
        {rfq.deadline && (
          <div className="bg-card border border-primary rounded-sm p-4">
            <p className="text-[11px] text-secondary uppercase tracking-wider mb-1">Deadline</p>
            <p className="heading-sm text-primary">{new Date(rfq.deadline).toLocaleDateString()}</p>
          </div>
        )}
        {rfq.quantity && (
          <div className="bg-card border border-primary rounded-sm p-4">
            <p className="text-[11px] text-secondary uppercase tracking-wider mb-1">Quantity</p>
            <p className="heading-sm text-primary">{rfq.quantity} {rfq.unit || ''}</p>
          </div>
        )}
        <div className="bg-card border border-primary rounded-sm p-4">
          <p className="text-[11px] text-secondary uppercase tracking-wider mb-1">Quotes Received</p>
          <p className="heading-sm text-tese-green">{quotes.length}</p>
        </div>
      </div>

      {/* Requirements */}
      {rfq.requirements && (
        <div className="mb-8">
          <h2 className="heading-md text-primary mb-3">Requirements</h2>
          <div className="bg-card border border-primary rounded-sm p-5 text-md text-secondary whitespace-pre-wrap">
            {rfq.requirements}
          </div>
        </div>
      )}

      {/* Received Quotes */}
      <div>
        <h2 className="heading-md text-primary mb-4">
          Received Quotes ({quotes.length})
        </h2>
        {quotes.length === 0 ? (
          <div className="text-center py-12 bg-card border border-primary rounded-sm">
            <svg className="w-12 h-12 text-secondary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="heading-sm text-primary mb-1">Waiting for quotes</h3>
            <p className="text-sm text-secondary">Vendors are reviewing your request. Quotes will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className={`border rounded-sm p-5 transition-all cursor-pointer ${
                  selectedQuote === quote.id
                    ? 'border-action bg-accent shadow-card'
                    : 'border-primary bg-card hover:border-action hover:shadow-card'
                }`}
                onClick={() => setSelectedQuote(quote.id === selectedQuote ? null : quote.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-action flex items-center justify-center">
                      <span className="text-sm font-semibold text-action-on-primary">
                        {quote.seller?.name?.charAt(0) || 'V'}
                      </span>
                    </div>
                    <div>
                      <p className="label-md text-primary">{quote.seller?.name || 'Vendor'}</p>
                      <p className="text-[11px] text-secondary">v{quote.version_number}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="heading-lg text-primary">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: quote.currency_code || 'USD',
                      minimumFractionDigits: 0,
                    }).format(quote.total_amount / 100)}
                  </p>
                </div>

                {quote.delivery_days && (
                  <p className="text-sm text-secondary mb-2">
                    Delivery: {quote.delivery_days} days
                  </p>
                )}

                {quote.valid_until && (
                  <p className="text-[11px] text-secondary">
                    Valid until: {new Date(quote.valid_until).toLocaleDateString()}
                  </p>
                )}

                {/* Actions */}
                {['sent', 'viewed'].includes(quote.status) && rfq.status !== 'accepted' && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-primary">
                    <button className="flex-1 py-2 text-sm font-medium bg-action hover:bg-action-hover text-action-on-primary rounded-xs transition-colors">
                      Accept
                    </button>
                    <button className="flex-1 py-2 text-sm font-medium bg-action-secondary hover:bg-action-secondary-hover text-primary rounded-xs transition-colors">
                      Negotiate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
