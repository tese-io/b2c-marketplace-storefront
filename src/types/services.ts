export type ServiceType =
  | 'esg_audit'
  | 'carbon_consulting'
  | 'sustainability_strategy'
  | 'impact_reporting'
  | 'training'
  | 'certification_support'
  | 'supply_chain_audit'
  | 'other'

export type ServiceStatus = 'draft' | 'pending_approval' | 'active' | 'suspended' | 'archived'

export type TierLevel = 'basic' | 'pro' | 'enterprise'

export interface ServiceTier {
  id: string
  tier_level: TierLevel
  name: string
  price: number
  currency_code: string
  features: string[]
  delivery_days: number
  revision_count: number
  deliverables_included: string[]
}

export interface ServiceDeliverable {
  id: string
  name: string
  description: string
  file_format?: string
}

export interface ServiceProvider {
  id: string
  seller_id: string
  company_name: string
  bio?: string
  certifications: string[]
  specializations: string[]
  years_experience: number
  completed_projects: number
  average_rating: number
  verification_status: 'pending' | 'verified' | 'rejected'
}

export interface Service {
  id: string
  title: string
  handle: string
  description: string
  long_description?: string
  service_type: ServiceType
  category_id?: string
  seller_id: string
  status: ServiceStatus
  thumbnail?: string
  images?: string[]
  tiers: ServiceTier[]
  deliverables: ServiceDeliverable[]
  provider?: ServiceProvider
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  handle: string
  description?: string
  icon?: string
  parent_id?: string
  children?: ServiceCategory[]
}
