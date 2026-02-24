import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getService } from '@/lib/data/services'
import { ServiceDetail } from '@/components/services/ServiceDetail'

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const service = await getService(id)
  if (!service) return { title: 'Service Not Found' }

  return {
    title: service.title,
    description: service.description,
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params
  const service = await getService(id)

  if (!service) {
    notFound()
  }

  return (
    <main className="container">
      <ServiceDetail service={service} />
    </main>
  )
}
