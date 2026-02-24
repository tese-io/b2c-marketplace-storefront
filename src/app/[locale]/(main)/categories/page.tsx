import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Suspense } from "react"

import { Breadcrumbs } from "@/components/atoms"
import { HomeCategories, ProductListing, AlgoliaProductsListing } from "@/components/sections"
import { getRegion } from "@/lib/data/regions"
import isBot from "@/lib/helpers/isBot"
import { headers } from "next/headers"
import type { Metadata } from "next"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import { listProducts } from "@/lib/data/products"
import { toHreflang } from "@/lib/helpers/hreflang"

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || []).flatMap((r) => r.countries?.map((c) => c.iso_2) || [])
      )
    ) as string[]
    languages = locales.reduce<Record<string, string>>((acc, code) => {
      acc[toHreflang(code)] = `${baseUrl}/${code}/categories`
      return acc
    }, {})
  } catch {
    languages = { [toHreflang(locale)]: `${baseUrl}/${locale}/categories` }
  }

  const title = "Categories"
  const description = `Browse sustainable products and ESG services by category—ESG audits, consulting, reporting, carbon & climate, circular economy. ${
    process.env.NEXT_PUBLIC_SITE_NAME || "tese.io Sustainability Marketplace"
  }`
  const canonical = `${baseUrl}/${locale}/categories`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": `${baseUrl}/categories` },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || "tese.io Sustainability Marketplace"}`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "tese.io Sustainability Marketplace",
      type: "website",
    },
  }
}

async function AllCategories({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ listing_type?: string; query?: string; ai_search?: string }>
}) {
  const { locale } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const listing_type = resolvedSearchParams?.listing_type === 'service' || resolvedSearchParams?.listing_type === 'product'
    ? resolvedSearchParams.listing_type
    : undefined
  const query = resolvedSearchParams?.query
  const ai_search = resolvedSearchParams?.ai_search

  const ua = (await headers()).get("user-agent") || ""
  const bot = isBot(ua)

  const breadcrumbsItems = [
    { path: "/", label: "Home" },
    { path: "/categories", label: "Categories" },
  ]

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  // Fetch a small cached list for ItemList JSON-LD
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const {
    response: { products: jsonLdProducts },
  } = await listProducts({
    countryCode: locale,
    queryParams: { limit: 8, order: "created_at", fields: "id,title,handle" },
  })

  const itemList = jsonLdProducts.slice(0, 8).map((p, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: `${baseUrl}/${locale}/products/${p.handle}`,
    name: p.title,
  }))

  return (
    <main className="container">
      <Script
        id="ld-breadcrumbs-categories"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Categories",
                item: `${baseUrl}/${locale}/categories`,
              },
            ],
          }),
        }}
      />
      <Script
        id="ld-itemlist-categories"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: itemList,
          }),
        }}
      />
      <div className="hidden md:block mb-6">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      <div className="mb-8">
        <h1 className="heading-xl text-primary mb-2">
          {query ? `Search Results for "${query}"` : 'Categories'}
        </h1>
        <p className="text-lg text-secondary max-w-2xl">
          {query
            ? `Showing products matching your search ${ai_search === 'true' ? 'using AI-powered natural language understanding' : ''}`
            : 'Explore our comprehensive range of sustainable products and ESG services organized by category.'}
        </p>
      </div>

      {query ? (
        <Suspense fallback={<ProductListingSkeleton />}>
          <AlgoliaProductsListing
            locale={locale}
            currency_code={currency_code}
          />
        </Suspense>
      ) : (
        <section>
          <HomeCategories heading="BROWSE BY CATEGORY" useGrid={true} />
        </section>
      )}
    </main>
  )
}

export default AllCategories
