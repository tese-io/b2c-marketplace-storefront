import { ProductListingSkeleton } from '@/components/organisms/ProductListingSkeleton/ProductListingSkeleton'
import { CatalogPage } from '@/components/sections/CatalogPage/CatalogPage'
import { getCategoryByHandle, listCategories } from '@/lib/data/categories'
import { getSectorPreferencesFromCookies } from '@/lib/data/cookies'
import { resolveSectorPreferences } from '@/lib/helpers/sector-preferences'
import { buildLanguageAlternates } from '@/lib/i18n/alternates'
import { getCountryCode } from '@/lib/i18n/locale'
import { listRegions } from '@/lib/data/regions'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { Suspense } from 'react'

export const revalidate = 60

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; locale: string }>
  searchParams: Promise<{ sector?: string; industry?: string }>
}): Promise<Metadata> {
  const { category: categoryHandle, locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  const sp = await searchParams
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
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
    languages = buildLanguageAlternates(locales, baseUrl, `/categories/${categoryHandle}`)
  } catch {
    languages = buildLanguageAlternates(
      [getCountryCode(locale)],
      baseUrl,
      `/categories/${categoryHandle}`
    )
  }

  const title = `${cat.name}`
  const description = `${cat.name} — sustainable listings on ${
    process.env.NEXT_PUBLIC_SITE_NAME || 'tese.io'
  }`
  const query = new URLSearchParams()
  if (sp.sector) query.set('sector', sp.sector)
  if (sp.industry) query.set('industry', sp.industry)
  const qs = query.toString()
  const canonical = `${baseUrl}/${localeSegment}/categories/${categoryHandle}${qs ? `?${qs}` : ''}`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        'x-default': `${baseUrl}/categories/${categoryHandle}`,
      },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || 'tese.io'}`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'tese.io',
      type: 'website',
    },
  }
}

async function Category({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; locale: string }>
  searchParams: Promise<{
    sector?: string
    industry?: string
    listing?: string
    query?: string
    page?: string
  }>
}) {
  const { category: categoryHandle, locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  const sp = await searchParams
  const listingType = sp.listing === 'service' ? 'service' : undefined

  const category = await getCategoryByHandle(categoryHandle)
  if (!category) {
    return notFound()
  }

  const cookiePrefs = await getSectorPreferencesFromCookies()
  const { parentCategories } = await listCategories()
  const { sector, sectorId, industryHandle } = resolveSectorPreferences(
    sp,
    cookiePrefs,
    parentCategories
  )

  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  return (
    <main>
      <Script
        id="ld-breadcrumbs-category"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: category.name,
                item: `${baseUrl}/${locale}/categories/${categoryHandle}`,
              },
            ],
          }),
        }}
      />
      <Suspense
        fallback={
          <div data-testid="category-page-loading">
            <ProductListingSkeleton />
          </div>
        }
      >
        <CatalogPage
          locale={locale}
          sector={sector}
          sectorId={sectorId}
          industryHandle={industryHandle}
          category={category}
          listingType={listingType}
          query={sp.query}
          page={sp.page ? Number(sp.page) : undefined}
          facetParams={sp}
        />
      </Suspense>
    </main>
  )
}

export default Category
