import type { Metadata } from 'next'

import { SourcingPlaceholderView } from '@/components/sections/SourcingPlaceholderView/SourcingPlaceholderView'

export const metadata: Metadata = {
  title: 'My lists',
  description: 'Save products and suppliers from your sourcing sessions.',
}

export default function SourcingListsPage() {
  return (
    <SourcingPlaceholderView
      title="No saved items yet"
      description="Pin catalogue matches and discovered suppliers to lists while you source — coming soon."
      actionLabel="Start sourcing"
      actionHref="/sourcing"
      icon="lists"
    />
  )
}
