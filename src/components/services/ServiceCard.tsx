import Image from 'next/image'
import { LocalizedClientLink } from '@/components/molecules/LocalizedLink/LocalizedLink'
import { Service, TierLevel } from '@/types/services'

interface ServiceCardProps {
  service: Service
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  esg_audit: 'ESG Audit',
  carbon_consulting: 'Carbon Consulting',
  sustainability_strategy: 'Sustainability Strategy',
  impact_reporting: 'Impact Reporting',
  training: 'Training',
  certification_support: 'Certification',
  supply_chain_audit: 'Supply Chain',
}

function getLowestPrice(service: Service) {
  if (!service.tiers || service.tiers.length === 0) return null
  const sorted = [...service.tiers].sort((a, b) => a.price - b.price)
  return sorted[0]
}

export function ServiceCard({ service }: ServiceCardProps) {
  const lowestTier = getLowestPrice(service)

  return (
    <LocalizedClientLink
      href={`/services/${service.id}`}
      className="group block bg-card rounded-sm border border-primary overflow-hidden transition-all hover:shadow-card-hover hover:border-action"
    >
      {service.thumbnail && (
        <div className="relative aspect-[16/10] bg-component-secondary overflow-hidden">
          <Image
            src={service.thumbnail}
            alt={service.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-accent text-tese-dark text-[11px] font-medium">
            {SERVICE_TYPE_LABELS[service.service_type] || service.service_type}
          </span>
          {service.provider?.verification_status === 'verified' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-xs bg-positive-secondary text-positive text-[11px] font-medium">
              Verified
            </span>
          )}
        </div>

        <h3 className="heading-sm text-primary mb-1 line-clamp-2 group-hover:text-action transition-colors">
          {service.title}
        </h3>

        <p className="text-sm text-secondary mb-4 line-clamp-2">
          {service.description}
        </p>

        {service.provider && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-action flex items-center justify-center">
              <span className="text-[10px] font-semibold text-action-on-primary">
                {service.provider.company_name?.charAt(0) || 'S'}
              </span>
            </div>
            <span className="text-sm text-secondary">{service.provider.company_name}</span>
            {service.provider.average_rating > 0 && (
              <span className="text-sm text-secondary flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {service.provider.average_rating.toFixed(1)}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-primary">
          {lowestTier ? (
            <div>
              <span className="text-sm text-secondary">From </span>
              <span className="heading-sm text-primary">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: lowestTier.currency_code || 'USD',
                  minimumFractionDigits: 0,
                }).format(lowestTier.price / 100)}
              </span>
            </div>
          ) : (
            <span className="label-sm text-action">Get Custom Quote</span>
          )}
          {service.tiers && service.tiers.length > 1 && (
            <span className="text-[11px] text-secondary">
              {service.tiers.length} tiers available
            </span>
          )}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
