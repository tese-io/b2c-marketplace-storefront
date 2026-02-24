import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRfqRequest } from '@/lib/data/rfq'
import { RfqDetail } from '@/components/rfq/RfqDetail'

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const rfq = await getRfqRequest(id)
  if (!rfq) return { title: 'RFQ Not Found' }
  return { title: `RFQ: ${rfq.title}` }
}

export default async function RfqDetailPage({ params }: Props) {
  const { id } = await params
  const rfq = await getRfqRequest(id)

  if (!rfq) {
    notFound()
  }

  return (
    <main className="container">
      <RfqDetail rfq={rfq} />
    </main>
  )
}
