import { InquiryDetail } from '@/components/sections/SourcingInquiries/InquiryDetail'

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params
  return <InquiryDetail enquiryId={id} />
}
