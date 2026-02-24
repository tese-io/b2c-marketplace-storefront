import { Metadata } from 'next'
import { listRfqRequests } from '@/lib/data/rfq'
import { RfqList } from '@/components/rfq/RfqList'

export const metadata: Metadata = {
  title: 'My RFQ Requests',
  description: 'Manage your Request for Quotation requests and track received quotes.'
}

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'quoting', label: 'Quoting' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'in_negotiation', label: 'Negotiating' },
  { value: 'accepted', label: 'Accepted' },
]

export default async function RfqPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const status = typeof params.status === 'string' ? params.status : undefined
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const limit = 20
  const offset = (page - 1) * limit

  const { rfq_requests, count } = await listRfqRequests({ status, limit, offset })

  return (
    <main className="container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading-xl text-primary mb-1">My RFQ Requests</h1>
          <p className="text-md text-secondary">
            Request quotes from vendors and negotiate the best terms for your business.
          </p>
        </div>
        <a
          href="/rfq/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-action hover:bg-action-hover text-action-on-primary font-semibold rounded-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create RFQ
        </a>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-primary">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={`?${tab.value ? `status=${tab.value}` : ''}`}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              (status || '') === tab.value
                ? 'border-action text-action'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <RfqList rfqRequests={rfq_requests} />

      {count === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-tese-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="heading-md text-primary mb-2">No RFQ requests yet</h3>
          <p className="text-md text-secondary mb-4">
            Create your first Request for Quotation to get competitive quotes from verified vendors.
          </p>
          <a
            href="/rfq/create"
            className="inline-flex px-6 py-3 bg-action hover:bg-action-hover text-action-on-primary font-semibold rounded-sm transition-colors"
          >
            Create Your First RFQ
          </a>
        </div>
      )}
    </main>
  )
}
