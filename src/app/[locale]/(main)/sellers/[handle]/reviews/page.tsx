import { SellerTabs } from "@/components/organisms"
import { SellerPageHeader } from "@/components/sections"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { getSellerByHandle } from "@/lib/data/seller"
import { getSellerOrbitProfile } from "@/lib/data/seller-orbit"
import { SellerProps } from "@/types/seller"
import { getCountryCode } from "@/lib/i18n/locale"

export default async function SellerReviewsPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)

  const seller = (await getSellerByHandle(handle)) as SellerProps
  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  const user = await retrieveCustomer()

  const tab = "reviews"

  const orbit = await getSellerOrbitProfile(handle, locale)

  return (
    <main className="tese-seller-page">
      <section className="tese-seller-hero-stage">
        <div className="tese-container tese-seller-breadcrumb-wrap">
          <nav aria-label="Breadcrumb">
            <ol className="tese-pdp-breadcrumb tese-seller-breadcrumb">
              <li>
                <LocalizedClientLink href="/">Home</LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories">Suppliers</LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href={`/sellers/${seller.handle}`}>
                  {seller.name}
                </LocalizedClientLink>
              </li>
              <li aria-current="page">Reviews</li>
            </ol>
          </nav>
        </div>
        <div className="tese-seller-hero-band tese-grain" />
      </section>
      <div className="tese-container tese-seller-shell">
        <SellerPageHeader seller={seller} user={user} orbit={orbit} />
        <SellerTabs
          tab={tab}
          seller_id={seller.id}
          seller_handle={seller.handle}
          seller_name={seller.name}
          locale={locale}
          currency_code={currency_code}
          orbit={orbit}
        />
      </div>
    </main>
  )
}
