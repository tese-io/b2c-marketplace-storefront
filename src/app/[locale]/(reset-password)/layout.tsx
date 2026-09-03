import { Footer, Header } from "@/components/organisms"
import { checkRegion } from "@/lib/helpers/check-region"
import { redirect } from "next/navigation"
import { getCountryCode } from "@/lib/i18n/locale"

export default async function ResetPasswordLayout({
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
    return redirect("/")
  }

  return (
    <>
      <Header locale={locale} />
      {children}
      <Footer />
    </>
  )
}
