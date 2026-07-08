import { SourcingQuotePortal } from '@/components/sections/SourcingQuotePortal/SourcingQuotePortal'

export default async function QuotePortalPage({
  params,
}: {
  params: Promise<{ token: string; locale: string }>
}) {
  const { token } = await params
  return <SourcingQuotePortal token={token} />
}
