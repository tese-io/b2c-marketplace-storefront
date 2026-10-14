import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SourcingWorkspace } from '@/components/sections/SourcingWorkspace/SourcingWorkspace'
import { getCountryCode } from '@/lib/i18n/locale'

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
  const { locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  return (
    <Suspense fallback={<SourcingFallback />}>
      <SourcingWorkspace locale={localeSegment} />
    </Suspense>
  )
}
