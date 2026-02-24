import { Metadata } from 'next'
import { RfqCreateForm } from '@/components/rfq/RfqCreateForm'

export const metadata: Metadata = {
  title: 'Create RFQ',
  description: 'Create a new Request for Quotation.'
}

export default function CreateRfqPage() {
  return (
    <main className="container max-w-3xl mx-auto">
      <div className="mb-8">
        <nav className="text-sm text-secondary mb-4 flex items-center gap-2">
          <a href="/rfq" className="hover:text-action transition-colors">My RFQs</a>
          <span>/</span>
          <span className="text-primary">Create New RFQ</span>
        </nav>
        <h1 className="heading-xl text-primary mb-2">Create Request for Quotation</h1>
        <p className="text-md text-secondary">
          Describe what you need and receive competitive quotes from qualified vendors.
        </p>
      </div>
      <RfqCreateForm />
    </main>
  )
}
