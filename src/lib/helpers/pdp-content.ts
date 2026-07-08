import { HttpTypes } from '@medusajs/types'

import { PDP_EMPTY } from '@/data/explorer-copy'

import { getProductMetadata } from './product-procurement'

export type PdpContentBlock = {
  title: string
  body: string
}

function asStringArray (value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|,/)
      .map((v) => v.trim())
      .filter(Boolean)
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => (v != null && v !== '' ? `${k}: ${v}` : k))
      .filter(Boolean)
  }
  return [String(value)]
}

export function getProductKeyFeatures (product: HttpTypes.StoreProduct): string[] {
  const meta = getProductMetadata(product)
  return asStringArray(meta.keyFeatures)
}

export function getProductUseCases (product: HttpTypes.StoreProduct): PdpContentBlock[] {
  const meta = getProductMetadata(product)
  const raw = meta.useCases

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return { title: 'Use case', body: item }
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          const title = String(o.title || o.name || 'Use case')
          const body = String(o.description || o.summary || o.body || '')
          return body ? { title, body } : null
        }
        return null
      })
      .filter(Boolean) as PdpContentBlock[]
  }

  return asStringArray(raw).map((body) => ({ title: 'Use case', body }))
}

export function getProductImpactMetrics (product: HttpTypes.StoreProduct): PdpContentBlock[] {
  const meta = getProductMetadata(product)
  const metrics = meta.environmentalImpactMetrics ?? meta.esgMetrics

  if (!metrics) return []

  if (typeof metrics === 'object' && !Array.isArray(metrics)) {
    return Object.entries(metrics as Record<string, unknown>)
      .filter(([, v]) => v != null && v !== '')
      .map(([title, body]) => ({ title, body: String(body) }))
  }

  return asStringArray(metrics).map((body) => ({ title: 'Impact', body }))
}

export function getProductCertificationList (product: HttpTypes.StoreProduct): string[] {
  const meta = getProductMetadata(product)
  return asStringArray(meta.certifications)
}

export function getProductDocuments (product: HttpTypes.StoreProduct): PdpContentBlock[] {
  const meta = getProductMetadata(product)
  const docs = meta.supportingDocuments

  if (Array.isArray(docs)) {
    return docs
      .map((item) => {
        if (typeof item === 'string') return { title: 'Document', body: item }
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          return {
            title: String(o.title || o.name || 'Document'),
            body: String(o.url || o.description || o.href || ''),
          }
        }
        return null
      })
      .filter(Boolean) as PdpContentBlock[]
  }

  return asStringArray(docs).map((body) => ({ title: 'Document', body }))
}

export function getProductFaqs (product: HttpTypes.StoreProduct): PdpContentBlock[] {
  const meta = getProductMetadata(product)
  const faqs = meta.faqs

  if (Array.isArray(faqs)) {
    return faqs
      .map((item) => {
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>
          return {
            title: String(o.question || o.title || 'FAQ'),
            body: String(o.answer || o.body || ''),
          }
        }
        return null
      })
      .filter((x) => x?.body) as PdpContentBlock[]
  }

  return []
}

export function getProductAtAGlance (product: HttpTypes.StoreProduct): string[] {
  const meta = getProductMetadata(product)
  const lines: string[] = []

  if (meta.origin) lines.push(`Origin: ${meta.origin}`)
  if (meta.lead_time_days) lines.push(`Lead time: ${meta.lead_time_days} days`)
  if (meta.maturity_stage || meta.trl) {
    lines.push(`Readiness: ${meta.maturity_stage || meta.trl}`)
  }
  if (product.created_at) {
    lines.push(`Listed: ${new Date(product.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`)
  }

  return lines
}

export { PDP_EMPTY }
