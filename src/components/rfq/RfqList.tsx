import { RfqRequest, RfqStatus } from '@/types/rfq'
import { LocalizedClientLink } from '@/components/molecules/LocalizedLink/LocalizedLink'

interface RfqListProps {
  rfqRequests: RfqRequest[]
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
  converted: { label: 'Converted', className: 'bg-positive text-white' },
}

const TYPE_LABELS: Record<string, string> = {
  product: 'Product',
  service: 'Service',
  mixed: 'Mixed',
}

export function RfqList({ rfqRequests }: RfqListProps) {
  if (rfqRequests.length === 0) return null

  return (
    <div className="space-y-3">
      {rfqRequests.map((rfq) => {
        const statusCfg = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.draft
        const quoteCount = rfq.quotation_versions?.length || 0

        return (
          <LocalizedClientLink
            key={rfq.id}
            href={`/rfq/${rfq.id}`}
            className="flex items-center justify-between p-5 bg-card border border-primary rounded-sm hover:border-action hover:shadow-card transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="heading-sm text-primary truncate group-hover:text-action transition-colors">
                  {rfq.title}
                </h3>
                <span className={`inline-flex px-2 py-0.5 rounded-xs text-[11px] font-medium ${statusCfg.className}`}>
                  {statusCfg.label}
                </span>
                <span className="inline-flex px-2 py-0.5 rounded-xs bg-component-secondary text-[11px] text-secondary">
                  {TYPE_LABELS[rfq.rfq_type] || rfq.rfq_type}
                </span>
              </div>
              <p className="text-sm text-secondary line-clamp-1">{rfq.description}</p>
              <div className="flex items-center gap-4 mt-2 text-[12px] text-secondary">
                {rfq.budget_max && (
                  <span>
                    Budget: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: rfq.currency_code || 'USD',
                      minimumFractionDigits: 0,
                    }).format(rfq.budget_max / 100)}
                  </span>
                )}
                {rfq.deadline && (
                  <span>Deadline: {new Date(rfq.deadline).toLocaleDateString()}</span>
                )}
                <span>Created: {new Date(rfq.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              {quoteCount > 0 && (
                <div className="text-center">
                  <p className="heading-sm text-tese-green">{quoteCount}</p>
                  <p className="text-[11px] text-secondary">Quote{quoteCount !== 1 ? 's' : ''}</p>
                </div>
              )}
              <svg className="w-5 h-5 text-secondary group-hover:text-action transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
