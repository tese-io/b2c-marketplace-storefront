import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { getCategoryByHandle } from "@/lib/data/categories"
import { Suspense } from "react"

import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/atoms"
import { ProductListing } from "@/components/sections"
import { ProductFilters } from "@/components/products/ProductFilters"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import { listProducts } from "@/lib/data/products"
import { toHreflang } from "@/lib/helpers/hreflang"

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>
}): Promise<Metadata> {
  const { category: categoryHandle, locale } = await params
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const cat = await getCategoryByHandle(categoryHandle)
  if (!cat) {
    return {}
  }

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || []).flatMap((r) => r.countries?.map((c) => c.iso_2) || [])
      )
    ) as string[]
    languages = locales.reduce<Record<string, string>>((acc, code) => {
      acc[toHreflang(code)] = `${baseUrl}/${code}/categories/${categoryHandle}`
      return acc
    }, {})
  } catch {
    languages = {
      [toHreflang(locale)]: `${baseUrl}/${locale}/categories/${categoryHandle}`,
    }
  }

  const title = `${cat.name}`
  const description = cat.description || `Browse ${cat.name} products and services from verified sustainable vendors on tese.io`
  const canonical = `${baseUrl}/${locale}/categories/${categoryHandle}`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${baseUrl}/categories/${categoryHandle}`,
      },
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

async function Category({
  params,
  searchParams,
}: {
  params: Promise<{
    category: string
    locale: string
  }>
  searchParams?: Promise<{ subcategory?: string; listing_type?: string }>
}) {
  const { category: categoryHandle, locale } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const subcategory = typeof resolvedSearchParams?.subcategory === 'string'
    ? resolvedSearchParams.subcategory
    : undefined

  const category = await getCategoryByHandle(categoryHandle)

  if (!category) {
    return notFound()
  }

  // Get subcategories from category_children
  const subcategories = category.category_children || []
  const subcategoryOptions = subcategories.map((cat) => ({
    value: cat.handle,
    label: cat.name,
  }))

  const breadcrumbsItems = [
    { path: '/', label: 'Home' },
    { path: '/categories', label: 'Categories' },
    { path: `/categories/${categoryHandle}`, label: category.name },
  ]

  // Small cached list for JSON-LD itemList
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const {
    response: { products: jsonLdProducts },
  } = await listProducts({
    countryCode: locale,
    queryParams: { limit: 8, order: "created_at", fields: "id,title,handle" },
    category_id: category.id,
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
        id="ld-breadcrumbs-category"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: `${baseUrl}/${locale}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Categories",
                item: `${baseUrl}/${locale}/categories`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: category.name,
                item: `${baseUrl}/${locale}/categories/${categoryHandle}`,
              },
            ],
          }),
        }}
      />
      <Script
        id="ld-itemlist-category"
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
        <h1 className="heading-xl text-primary mb-2 uppercase">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-lg text-secondary max-w-2xl">
            {category.description}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with filters */}
        {subcategoryOptions.length > 0 && (
          <aside className="w-full lg:w-64 flex-shrink-0">
            <ProductFilters
              categories={subcategoryOptions}
              activeCategory={subcategory}
            />
          </aside>
        )}

        {/* Main product listing */}
        <div className="flex-1">
          <Suspense fallback={<ProductListingSkeleton />}>
            <ProductListing
              category_id={category.id}
              showSidebar={false}
              locale={locale}
              listing_type={undefined}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

export default Category
