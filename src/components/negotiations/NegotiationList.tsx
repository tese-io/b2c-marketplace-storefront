import { NegotiationThread, NegotiationThreadStatus } from '@/types/rfq'
import { LocalizedClientLink } from '@/components/molecules/LocalizedLink/LocalizedLink'

interface NegotiationListProps {
  negotiations: NegotiationThread[]
}

const STATUS_CONFIG: Record<NegotiationThreadStatus, { label: string; className: string; dot: string }> = {
  active: { label: 'Active', className: 'text-positive', dot: 'bg-positive' },
  awaiting_buyer: { label: 'Your Turn', className: 'text-action', dot: 'bg-action' },
  awaiting_seller: { label: 'Awaiting Vendor', className: 'text-secondary', dot: 'bg-secondary' },
  on_hold: { label: 'On Hold', className: 'text-warning', dot: 'bg-warning' },
  closed_accepted: { label: 'Accepted', className: 'text-positive', dot: 'bg-positive' },
  closed_rejected: { label: 'Rejected', className: 'text-negative', dot: 'bg-negative' },
  closed_expired: { label: 'Expired', className: 'text-disabled', dot: 'bg-disabled' },
}

export function NegotiationList({ negotiations }: NegotiationListProps) {
  if (negotiations.length === 0) return null

  return (
    <div className="space-y-3">
      {negotiations.map((neg) => {
        const statusCfg = STATUS_CONFIG[neg.status] || STATUS_CONFIG.active

        return (
          <LocalizedClientLink
            key={neg.id}
            href={`/negotiations/${neg.id}`}
            className="flex items-center justify-between p-5 bg-card border border-primary rounded-sm hover:border-action hover:shadow-card transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-action-ice flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-tese-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="heading-sm text-primary group-hover:text-action transition-colors">
                    Negotiation #{neg.id.slice(-6)}
                  </h3>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                    <span className={`text-[11px] font-medium ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                  </span>
                </div>
                <p className="text-sm text-secondary">
                  {neg.proposal_count} of {neg.max_proposals} proposals used
                </p>
                <p className="text-[11px] text-secondary mt-0.5">
                  Last updated: {new Date(neg.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <svg className="w-5 h-5 text-secondary group-hover:text-action transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </LocalizedClientLink>
        )
      })}
    </div>
  )
}
