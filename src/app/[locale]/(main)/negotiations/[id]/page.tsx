import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getNegotiation, getNegotiationMessages } from '@/lib/data/rfq'
import { NegotiationChat } from '@/components/negotiations/NegotiationChat'

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export const metadata: Metadata = {
  title: 'Negotiation',
}

export default async function NegotiationDetailPage({ params }: Props) {
  const { id } = await params
  const [negotiation, messagesData] = await Promise.all([
    getNegotiation(id),
    getNegotiationMessages(id, { limit: 50 }),
  ])

  if (!negotiation) {
    notFound()
  }

  return (
    <main className="container max-w-4xl mx-auto">
      <NegotiationChat
        negotiation={negotiation}
        initialMessages={messagesData.messages}
      />
    </main>
  )
}
