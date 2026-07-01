import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SourcingWorkspace } from '@/components/sections/SourcingWorkspace/SourcingWorkspace'

export const metadata: Metadata = {
  title: 'AI Sourcing',
  description:
    'Describe what you need in plain language. tese.io matches certified suppliers, checks sustainability credentials, and scans the web for alternatives.',
}

function SourcingFallback() {
  return (
    <div className="tese-sourcing-loading" role="status">
      Loading sourcing workspace…
    </div>
  )
}

export default async function SourcingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <Suspense fallback={<SourcingFallback />}>
      <SourcingWorkspace locale={locale} />
    </Suspense>
  )
}
