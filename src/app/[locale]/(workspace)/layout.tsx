import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { MatrixProvider } from '@/components/providers'
import { SourcingAppShell } from '@/components/sections/SourcingAppShell/SourcingAppShell'
import { retrieveCustomer } from '@/lib/data/customer'
import { checkRegion } from '@/lib/helpers/check-region'

function WorkspaceShellFallback () {
  return (
    <div className="tese-sourcing-loading" role="status">
      Loading workspace…
    </div>
  )
}

export default async function WorkspaceLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  const user = await retrieveCustomer()
  const regionCheck = await checkRegion(locale)

  if (!regionCheck) {
    return redirect('/')
  }

  const shell = (
    <Suspense fallback={<WorkspaceShellFallback />}>
      <SourcingAppShell locale={locale} user={user}>
        {children}
      </SourcingAppShell>
    </Suspense>
  )

  if (!user?.id) {
    return shell
  }

  return <MatrixProvider>{shell}</MatrixProvider>
}
