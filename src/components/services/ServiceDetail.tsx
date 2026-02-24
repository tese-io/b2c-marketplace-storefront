'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Service, ServiceTier, TierLevel } from '@/types/services'

interface ServiceDetailProps {
  service: Service
}

const TIER_ORDER: TierLevel[] = ['basic', 'pro', 'enterprise']

const SERVICE_TYPE_LABELS: Record<string, string> = {
  esg_audit: 'ESG Auditing',
  carbon_consulting: 'Carbon Consulting',
  sustainability_strategy: 'Sustainability Strategy',
  impact_reporting: 'Impact Reporting',
  training: 'Training & Education',
  certification_support: 'Certification Support',
  supply_chain_audit: 'Supply Chain Audit',
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const [selectedTier, setSelectedTier] = useState<string | null>(
    service.tiers?.[0]?.id || null
  )
  const [showQuoteForm, setShowQuoteForm] = useState(false)

  const sortedTiers = [...(service.tiers || [])].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier_level) - TIER_ORDER.indexOf(b.tier_level)
  )

  const activeTier = sortedTiers.find((t) => t.id === selectedTier)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-secondary mb-6 flex items-center gap-2">
        <a href="/services" className="hover:text-action transition-colors">Services</a>
        <span>/</span>
        <span className="text-primary">{service.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex px-3 py-1 rounded-xs bg-accent text-tese-dark text-sm font-medium">
                {SERVICE_TYPE_LABELS[service.service_type] || service.service_type}
              </span>
              {service.provider?.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xs bg-positive-secondary text-positive text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified Provider
                </span>
              )}
            </div>
            <h1 className="heading-xl text-primary mb-3">{service.title}</h1>
            <p className="text-lg text-secondary">{service.description}</p>
          </div>

          {/* Thumbnail */}
          {service.thumbnail && (
            <div className="relative aspect-video rounded-sm overflow-hidden">
              <Image
                src={service.thumbnail}
                alt={service.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Long Description */}
          {service.long_description && (
            <div>
              <h2 className="heading-md text-primary mb-4">About This Service</h2>
              <div className="text-md text-secondary leading-relaxed whitespace-pre-wrap">
                {service.long_description}
              </div>
            </div>
          )}

          {/* Deliverables */}
          {service.deliverables && service.deliverables.length > 0 && (
            <div>
              <h2 className="heading-md text-primary mb-4">Deliverables</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="border border-primary rounded-sm p-4 bg-card"
                  >
                    <h3 className="label-md text-primary mb-1">{d.name}</h3>
                    <p className="text-sm text-secondary">{d.description}</p>
                    {d.file_format && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-component-secondary rounded-xs text-[11px] text-secondary">
                        {d.file_format}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Provider Info */}
          {service.provider && (
            <div className="border border-primary rounded-sm p-6 bg-card">
              <h2 className="heading-md text-primary mb-4">Service Provider</h2>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-action flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-semibold text-action-on-primary">
                    {service.provider.company_name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="label-lg text-primary">{service.provider.company_name}</h3>
                  {service.provider.bio && (
                    <p className="text-sm text-secondary mt-1">{service.provider.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-secondary">
                    {service.provider.years_experience > 0 && (
                      <span>{service.provider.years_experience} years experience</span>
                    )}
                    {service.provider.completed_projects > 0 && (
                      <span>{service.provider.completed_projects} projects completed</span>
                    )}
                    {service.provider.average_rating > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {service.provider.average_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {service.provider.certifications && service.provider.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {service.provider.certifications.map((cert, i) => (
                        <span
                          key={i}
                          className="inline-flex px-2 py-0.5 rounded-xs bg-action-ice text-[11px] font-medium text-tese-dark"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Tier Pricing Cards */}
            {sortedTiers.length > 0 ? (
              <div className="space-y-4">
                <h3 className="heading-sm text-primary">Choose a Plan</h3>
                {sortedTiers.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`w-full text-left rounded-sm border p-5 transition-all ${
                      selectedTier === tier.id
                        ? 'border-action bg-accent shadow-card'
                        : 'border-primary bg-card hover:border-action hover:shadow-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="label-md text-primary capitalize">
                        {tier.name || tier.tier_level}
                      </span>
                      {tier.tier_level === 'pro' && (
                        <span className="px-2 py-0.5 bg-action text-action-on-primary text-[10px] font-semibold rounded-xs uppercase">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="mb-3">
                      <span className="heading-lg text-primary">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: tier.currency_code || 'USD',
                          minimumFractionDigits: 0,
                        }).format(tier.price / 100)}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-tese-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {tier.delivery_days} day delivery
                      </p>
                      <p className="text-sm text-secondary flex items-center gap-2">
                        <svg className="w-4 h-4 text-tese-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {tier.revision_count} revision{tier.revision_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {tier.features && tier.features.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-primary space-y-1">
                        {tier.features.map((feature, i) => (
                          <p key={i} className="text-sm text-secondary flex items-start gap-2">
                            <svg className="w-4 h-4 text-positive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </p>
                        ))}
                      </div>
                    )}
                  </button>
                ))}

                <button className="w-full py-3 bg-action hover:bg-action-hover text-action-on-primary font-semibold rounded-sm transition-colors">
                  Continue with {activeTier?.name || activeTier?.tier_level || 'Plan'}
                </button>
              </div>
            ) : (
              <div className="border border-primary rounded-sm p-6 bg-card text-center">
                <p className="heading-sm text-primary mb-2">Custom Pricing</p>
                <p className="text-sm text-secondary mb-4">
                  This service requires a custom quote based on your requirements.
                </p>
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="w-full py-3 bg-action hover:bg-action-hover text-action-on-primary font-semibold rounded-sm transition-colors"
                >
                  Request a Quote
                </button>
              </div>
            )}

            {/* Request Custom Quote link */}
            {sortedTiers.length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowQuoteForm(!showQuoteForm)}
                  className="text-sm text-action hover:text-action-hover font-medium transition-colors"
                >
                  Need something different? Request a custom quote
                </button>
              </div>
            )}

            {/* Escrow protection badge */}
            <div className="flex items-center gap-3 p-4 bg-accent rounded-sm">
              <svg className="w-6 h-6 text-tese-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-primary">Escrow Protected</p>
                <p className="text-[11px] text-secondary">
                  Payment held securely until you approve deliverables
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
