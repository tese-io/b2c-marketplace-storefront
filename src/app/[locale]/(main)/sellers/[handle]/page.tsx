import { SellerTabs } from "@/components/organisms"
import { SellerPageHeader } from "@/components/sections"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { getSellerByHandle } from "@/lib/data/seller"
import { getSellerOrbitProfile } from "@/lib/data/seller-orbit"
import { SellerProps } from "@/types/seller"

export default async function SellerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params

  const seller = (await getSellerByHandle(handle)) as SellerProps

  const user = await retrieveCustomer()

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  const tab = "products"

  if (!seller) {
    return null
  }

  const orbit = await getSellerOrbitProfile(handle, locale)

  return (
    <main className="tese-seller-page">
      <section className="tese-seller-hero-stage" aria-hidden={false}>
        <div className="tese-container tese-seller-breadcrumb-wrap">
          <nav aria-label="Breadcrumb">
            <ol className="tese-pdp-breadcrumb tese-seller-breadcrumb">
              <li>
                <LocalizedClientLink href="/">Home</LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories">Suppliers</LocalizedClientLink>
              </li>
              <li aria-current="page">{seller.name}</li>
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
