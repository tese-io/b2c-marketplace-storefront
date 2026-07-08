import type { HttpTypes } from '@medusajs/types'

import { getProductPrice } from '@/lib/helpers/get-product-price'
import type { EnquiryTarget, StructuredRequirement } from '@/types/enquiry'

export type InquiryProductSummary = {
  handle: string
  title: string
  thumbnail?: string | null
  category?: string
  metadata?: Record<string, unknown>
  priceLabel?: string | null
}

export type InquiryPill = {
  label: string
  value: string
}

export function uniqueProductHandles (targets: EnquiryTarget[] = []): string[] {
  const seen = new Set<string>()
  const handles: string[] = []
  for (const target of targets) {
    const handle = target.productHandle?.trim()
    if (handle && !seen.has(handle)) {
      seen.add(handle)
      handles.push(handle)
    }
  }
  return handles
}

export function primaryProductHandle (targets: EnquiryTarget[] = []): string | null {
  for (const target of targets) {
    const handle = target.productHandle?.trim()
    if (handle) return handle
  }
  return null
}

export function parseQuantityFromRequirement (requirement: string): string | null {
  const match = requirement.match(/Quantity:\s*([^.]+)/i)
  return match?.[1]?.trim() || null
}

function normalizeMetaValue (value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  return String(value)
}

export function buildProductMetaPills (
  metadata?: Record<string, unknown>
): InquiryPill[] {
  if (!metadata) return []
  const pills: InquiryPill[] = []
  const push = (key: string, label: string) => {
    const value = normalizeMetaValue(metadata[key])
    if (value) pills.push({ label, value })
  }
  push('moq', 'MOQ')
  push('unit', 'Unit')
  push('origin', 'Origin')
  push('lead_time_days', 'Lead time (days)')
  const certs = metadata.certifications
  if (Array.isArray(certs) && certs.length) {
    pills.push({ label: 'Certifications', value: certs.join(', ') })
  } else {
    push('certifications', 'Certifications')
  }
  return pills
}

export function buildRequirementPills (
  structured: StructuredRequirement | undefined,
  requirement: string,
  productMeta?: Record<string, unknown>
): InquiryPill[] {
  const pills: InquiryPill[] = []
  const productUnit = normalizeMetaValue(productMeta?.unit)

  let quantity = structured?.quantity?.trim()
  if (!quantity) {
    quantity = parseQuantityFromRequirement(requirement) || undefined
  }
  if (quantity) pills.push({ label: 'Qty', value: quantity })

  const unit = structured?.unit?.trim()
  if (unit && unit !== productUnit) {
    pills.push({ label: 'Unit', value: unit })
  }

  const material = structured?.material?.trim()
  if (material) pills.push({ label: 'Material', value: material })

  const grade = structured?.grade?.trim()
  if (grade) pills.push({ label: 'Grade', value: grade })

  const region = structured?.region?.trim()
  if (region) pills.push({ label: 'Region', value: region })

  const certs = structured?.certifications
  if (certs?.length) {
    pills.push({ label: 'Certifications', value: certs.join(', ') })
  }

  return pills
}

export function productSummaryFromMedusa (
  product: HttpTypes.StoreProduct
): InquiryProductSummary {
  const handle = product.handle || ''
  const { cheapestPrice } = getProductPrice({ product })
  return {
    handle,
    title: product.title || handle,
    thumbnail: product.thumbnail,
    category: product.categories?.[0]?.name,
    metadata: (product.metadata as Record<string, unknown> | null) || undefined,
    priceLabel: cheapestPrice?.calculated_price || null,
  }
}

export function fallbackProductSummary (
  handle: string,
  target?: EnquiryTarget
): InquiryProductSummary {
  return {
    handle,
    title: target?.productTitle?.trim() || handle,
    thumbnail: null,
  }
}
