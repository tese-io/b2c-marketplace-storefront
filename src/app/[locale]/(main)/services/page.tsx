import { Metadata } from 'next'
import { listServices } from '@/lib/data/services'
import { ServiceGrid } from '@/components/services/ServiceGrid'
import { ServiceFilters } from '@/components/services/ServiceFilters'
import { Breadcrumbs } from '@/components/atoms'

export const metadata: Metadata = {
  title: 'ESG & Sustainability Services',
  description: 'Browse expert ESG auditing, carbon consulting, sustainability strategy, and impact reporting services from verified providers.'
}

const SERVICE_CATEGORIES = [
  { value: 'esg_audit', label: 'ESG Auditing' },
  { value: 'carbon_consulting', label: 'Carbon Consulting' },
  { value: 'sustainability_strategy', label: 'Sustainability Strategy' },
  { value: 'impact_reporting', label: 'Impact Reporting' },
  { value: 'training', label: 'Training & Education' },
  { value: 'certification_support', label: 'Certification Support' },
  { value: 'supply_chain_audit', label: 'Supply Chain Audit' },
]

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const category = typeof params.category === 'string' ? params.category : undefined
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const limit = 12
  const offset = (page - 1) * limit

  const { services, count } = await listServices({
    service_type: category,
    limit,
    offset,
    q: typeof params.q === 'string' ? params.q : undefined,
  })

  const totalPages = Math.ceil(count / limit)

  const breadcrumbsItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
  ]

  return (
    <main className="container">
      <div className="hidden md:block mb-6">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      <div className="mb-8">
        <h1 className="heading-xl text-primary mb-2">
          ESG & Sustainability Services
        </h1>
        <p className="text-lg text-secondary max-w-2xl">
          Connect with verified sustainability experts for auditing, consulting, strategy, and reporting services.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ServiceFilters
            categories={SERVICE_CATEGORIES}
            activeCategory={category}
          />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-secondary">
              {count} service{count !== 1 ? 's' : ''} found
            </p>
          </div>

          <ServiceGrid services={services} />

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?page=${p}${category ? `&category=${category}` : ''}`}
                  className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-action text-action-on-primary'
                      : 'bg-component-secondary hover:bg-component-secondary-hover text-primary'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
