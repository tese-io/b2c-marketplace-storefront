import { AuthChrome } from '@/components/sections/Auth/AuthChrome'
import { checkRegion } from '@/lib/helpers/check-region'
import { redirect } from 'next/navigation'
import { getCountryCode } from '@/lib/i18n/locale'

export default async function AuthLayout ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  const regionCheck = await checkRegion(locale)

  if (!regionCheck) {
    return redirect('/')
  }

  return (
    <AuthChrome>
      {children}
    </AuthChrome>
  )
}
