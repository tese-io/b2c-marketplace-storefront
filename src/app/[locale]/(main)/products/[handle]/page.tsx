import { ProductDetailsPage } from "@/components/sections/ProductDetailsPage/ProductDetailsPage"
import { listCatalogListings, listProducts } from "@/lib/data/products"
import { getSectorPreferencesFromCookies } from "@/lib/data/cookies"
import { listCategories } from "@/lib/data/categories"
import { resolveSectorPreferences } from "@/lib/helpers/sector-preferences"
import { getCatalogDisplayTitle, getCatalogHandle } from "@/lib/helpers/catalog-product"
import { generateProductMetadata } from "@/lib/helpers/seo"
import type { Metadata } from "next"
import { getCountryCode } from "@/lib/i18n/locale"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}): Promise<Metadata> {
  const { handle, locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)

  const prod = await listProducts({
    countryCode: locale,
    queryParams: { handle: [handle], limit: 1 },
    forceCache: true,
  }).then(({ response }) => response.products[0])

  if (!prod) {
    return generateProductMetadata(prod)
  }

  const catalogHandle = getCatalogHandle(prod) || handle
  const listings = await listCatalogListings({
    countryCode: locale,
    catalogHandle,
  })

  if (listings.length > 1) {
    return generateProductMetadata({
      ...prod,
      title: getCatalogDisplayTitle(listings),
    })
  }

  return generateProductMetadata(prod)
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>
  searchParams: Promise<{ brand?: string }>
}) {
  const { handle, locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  const { brand } = await searchParams
  const cookiePrefs = await getSectorPreferencesFromCookies()
  const { parentCategories } = await listCategories()
  const { sectorId } = resolveSectorPreferences(undefined, cookiePrefs, parentCategories)

  return (
    <main className="w-full bg-white">
      <ProductDetailsPage
        handle={handle}
        locale={locale}
        localeSegment={localeSegment}
        brand={brand}
        sectorId={sectorId}
      />
    </main>
  )
}
