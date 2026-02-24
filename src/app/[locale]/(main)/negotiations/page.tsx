import { Metadata } from 'next'
import { listNegotiations } from '@/lib/data/rfq'
import { NegotiationList } from '@/components/negotiations/NegotiationList'

export const metadata: Metadata = {
  title: 'Negotiations',
  description: 'Manage your active negotiations with vendors.'
}

export default async function NegotiationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const status = typeof params.status === 'string' ? params.status : undefined
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const limit = 20
  const offset = (page - 1) * limit

  const { negotiations, count } = await listNegotiations({ status, limit, offset })

  return (
    <main className="container">
      <div className="mb-8">
        <h1 className="heading-xl text-primary mb-1">Negotiations</h1>
        <p className="text-md text-secondary">
          Track and manage your active negotiations with vendors.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-primary">
        {[
          { value: '', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'awaiting_buyer', label: 'Awaiting Your Response' },
          { value: 'awaiting_seller', label: 'Awaiting Vendor' },
          { value: 'on_hold', label: 'On Hold' },
        ].map((tab) => (
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

      <NegotiationList negotiations={negotiations} />

      {count === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-tese-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="heading-md text-primary mb-2">No active negotiations</h3>
          <p className="text-md text-secondary mb-4">
            When you start negotiating with a vendor, your conversations will appear here.
          </p>
          <a
            href="/rfq"
            className="inline-flex px-6 py-3 bg-action hover:bg-action-hover text-action-on-primary font-semibold rounded-sm transition-colors"
          >
            View My RFQs
          </a>
        </div>
      )}
    </main>
  )
}
