import { Metadata } from 'next'
import { Suspense } from 'react'
import { ProductListingSkeleton } from '@/components/organisms/ProductListingSkeleton/ProductListingSkeleton'
import { ProductListing } from '@/components/sections'
import { Breadcrumbs } from '@/components/atoms'
import { ProductFilters } from '@/components/products/ProductFilters'

export const metadata: Metadata = {
  title: 'Sustainable Products',
  description: 'Browse sustainable and ESG-compliant products from verified vendors. Shop eco-friendly, ethical, and responsible products.',
}

export const revalidate = 60

const PRODUCT_CATEGORIES = [
  { value: 'clothing', label: 'Sustainable Clothing' },
  { value: 'home', label: 'Home & Living' },
  { value: 'office', label: 'Office Supplies' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'beauty', label: 'Beauty & Personal Care' },
]

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { locale } = await params
  const params_resolved = await searchParams
  const category = typeof params_resolved?.category === 'string' ? params_resolved.category : undefined

  const breadcrumbsItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
  ]

  return (
    <main className="container">
      <div className="hidden md:block mb-6">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      <div className="mb-8">
        <h1 className="heading-xl text-primary mb-2">
          Sustainable Products
        </h1>
        <p className="text-lg text-secondary max-w-2xl">
          Discover eco-friendly and ethically sourced products from verified sustainable vendors.
          Shop with confidence knowing every product meets our ESG standards.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ProductFilters
            categories={PRODUCT_CATEGORIES}
            activeCategory={category}
          />
        </aside>

        {/* Main product listing */}
        <div className="flex-1">
          <Suspense fallback={<ProductListingSkeleton />}>
            <ProductListing
              showSidebar={false}
              locale={locale}
              listing_type="product"
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
