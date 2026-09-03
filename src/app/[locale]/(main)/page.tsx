import {
  B2BHero,
  HomeCategories,
  HomeIndustriesSection,
  HomeInsights,
  HomePartners,
  HomePartnerStats,
  HomeProductSection,
  HomeSecondaryCTA,
  HomeServicesSection,
  HomeTestimonials,
  SourcingCTA,
  TrustStats,
} from "@/components/sections"
import { FEATURED_SECTION_SUBTITLE } from '@/data/explorer-copy'

import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"

import { listCategories } from "@/lib/data/categories"
import { getSectorPreferencesFromCookies } from "@/lib/data/cookies"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants/brand"
import { resolveSectorPreferences } from "@/lib/helpers/sector-preferences"
import { listRegions } from "@/lib/data/regions"
import { toContentLanguage } from "@/lib/helpers/hreflang"
import { buildLanguageAlternates } from "@/lib/i18n/alternates"
import { getCountryCode } from "@/lib/i18n/locale"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || [])
          .map((r) => r.countries?.map((c) => c.iso_2) || [])
          .flat()
          .filter(Boolean)
      )
    ) as string[]

    languages = buildLanguageAlternates(locales, baseUrl)
  } catch {
    languages = buildLanguageAlternates([getCountryCode(locale)], baseUrl)
  }

  const title = "Home"
  const description = SITE_DESCRIPTION
  const ogImage = "/B2C_Storefront_Open_Graph.png"
  const canonical = `${baseUrl}/${localeSegment}`

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`],
    },
  }
}

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ sector?: string; industry?: string }>
}) {
  const { locale: localeSegment } = await params
  const locale = getCountryCode(localeSegment)
  const query = await searchParams
  const cookiePrefs = await getSectorPreferencesFromCookies()
  const { parentCategories } = await listCategories()
  const { sector, industryHandle, sectorId } = resolveSectorPreferences(
    query,
    cookiePrefs,
    parentCategories
  )

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const featuredHeading =
    industryHandle && sector.id !== "all"
      ? `Featured in ${parentCategories.find((c) => c.handle === industryHandle)?.name || "your industry"}`
      : sector.id !== "all"
        ? `Featured in ${sector.shortLabel.toLowerCase()}`
        : "Featured sustainable listings"

  return (
    <main className="flex flex-col w-full text-primary">
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: `${baseUrl}/${locale}`,
            logo: `${baseUrl}/logo.png`,
          }),
        }}
      />
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: `${baseUrl}/${locale}`,
            inLanguage: toContentLanguage(),
          }),
        }}
      />
      <B2BHero locale={locale} sector={sector} />
      <TrustStats />
      <div className="tese-container pt-12 lg:pt-16 pb-14 lg:pb-16 w-full">
        <HomeCategories
          heading="Our products"
          subtitle="Circular, recycled, and low-carbon materials with certification traceability."
          sector={sector}
          sectorId={sectorId}
          industryHandle={industryHandle}
        />
      </div>
      <div className="tese-container pb-14 lg:pb-16 w-full">
        <HomeServicesSection />
      </div>
      <div className="tese-featured-band py-14 lg:py-16">
        <div className="tese-container">
          <HomeIndustriesSection />
        </div>
      </div>
      <div className="tese-featured-band py-14 lg:py-16">
        <div className="tese-container">
          <HomeProductSection
            heading={featuredHeading}
            subtitle={FEATURED_SECTION_SUBTITLE}
            locale={locale}
            home
            sector={sector}
            industryHandle={industryHandle}
            parentCategories={parentCategories}
          />
        </div>
      </div>
      <SourcingCTA />
      <HomePartnerStats />
      <div className="tese-container py-14 lg:py-16 w-full">
        <HomeTestimonials />
      </div>
      <div className="tese-featured-band py-14 lg:py-16">
        <div className="tese-container">
          <HomeInsights />
        </div>
      </div>
      <HomeSecondaryCTA />
      <HomePartners />
    </main>
  )
}
