import { ProductListingSkeleton } from '@/components/organisms/ProductListingSkeleton/ProductListingSkeleton'
import { CatalogPage } from '@/components/sections/CatalogPage/CatalogPage'
import { getSectorPreferencesFromCookies } from '@/lib/data/cookies'
import { resolveSectorPreferences } from '@/lib/helpers/sector-preferences'
import { listCategories } from '@/lib/data/categories'
import { buildLanguageAlternates } from '@/lib/i18n/alternates'
import { getCountryCode } from '@/lib/i18n/locale'
import { listRegions } from '@/lib/data/regions'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'
import { Suspense } from 'react'

export const revalidate = 60

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ sector?: string; industry?: string; listing?: string }>
}): Promise<Metadata> {
  const { locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  const sp = await searchParams
  const headersList = await headers()
  const host = headersList.get('host')
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || []).flatMap((r) => r.countries?.map((c) => c.iso_2) || [])
      )
    ) as string[]
    languages = buildLanguageAlternates(locales, baseUrl, '/categories')
  } catch {
    languages = buildLanguageAlternates([getCountryCode(locale)], baseUrl, '/categories')
  }

  const title = sp.listing === 'service' ? 'Services' : 'Products & services'
  const description = `Browse sustainable products and services on ${
    process.env.NEXT_PUBLIC_SITE_NAME || 'tese.io'
  }`
  const query = new URLSearchParams()
  if (sp.sector) query.set('sector', sp.sector)
  if (sp.industry) query.set('industry', sp.industry)
  if (sp.listing === 'service') query.set('listing', 'service')
  const qs = query.toString()
  const canonical = `${baseUrl}/${localeSegment}/categories${qs ? `?${qs}` : ''}`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ...languages, 'x-default': `${baseUrl}/categories` },
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

async function AllCategories({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    sector?: string
    industry?: string
    listing?: string
    query?: string
    page?: string
  }>
}) {
  const { locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  const sp = await searchParams
  const listingType = sp.listing === 'service' ? 'service' : undefined
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
        id="ld-breadcrumbs-categories"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Products',
                item: `${baseUrl}/${locale}/categories`,
              },
            ],
          }),
        }}
      />
      <Suspense
        fallback={
          <div data-testid="all-categories-page-loading">
            <ProductListingSkeleton />
          </div>
        }
      >
        <CatalogPage
          locale={locale}
          sector={sector}
          sectorId={sectorId}
          industryHandle={industryHandle}
          listingType={listingType}
          query={sp.query}
          page={sp.page ? Number(sp.page) : undefined}
          facetParams={sp}
        />
      </Suspense>
    </main>
  )
}

export default AllCategories
