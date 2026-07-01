import type { Metadata } from 'next'

import { SourcingInquiriesList } from '@/components/sections/SourcingInquiries/SourcingInquiriesList'

export const metadata: Metadata = {
  title: 'Inquiries',
  description: 'Send requirements to suppliers and track responses in one place.',
}

export default function SourcingInquiriesPage() {
  return <SourcingInquiriesList />
}
