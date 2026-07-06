/**
 * Shared types for the request-for-quote (RFQ) / enquiry flow.
 *
 * The RFQ source of truth is the external tese-backend service
 * (`/api/v3/storefront/*`, Mongo `storefront_enquiries`). These types mirror
 * that model so the storefront components stop redefining them inline.
 */

/** Enquiry-level lifecycle (tese-backend storefrontEnquiry.js status enum). */
export type EnquiryStatus =
  | 'draft'
  | 'open'
  | 'quoted'
  | 'accepted'
  | 'closed'
  | 'cancelled'

/** Per-target (per-seller) lifecycle (tese-backend TargetSchema status enum). */
export type TargetStatus =
  | 'draft'
  | 'sent'
  | 'quoted'
  | 'accepted'
  | 'declined'
  | 'closed'

/** How the enquiry originated. */
export type EnquirySourceType = 'ai_sourcing' | 'product_page' | 'manual'

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  quoted: 'Quoted',
  accepted: 'Accepted',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

export function enquiryStatusLabel(status: string): string {
  return ENQUIRY_STATUS_LABELS[status as EnquiryStatus] || status
}

export type EnquiryTarget = {
  _id?: string
  sellerId?: string | null
  sellerName?: string
  sellerEmail?: string
  productId?: string | null
  productHandle?: string | null
  productTitle?: string
  variantId?: string | null
  status?: TargetStatus | string
  quotedAmount?: number | null
  quotedCurrency?: string
  quoteNotes?: string
}

export type Enquiry = {
  enquiryId: string
  title: string
  requirement: string
  status: EnquiryStatus | string
  createdAt: string
  targets?: EnquiryTarget[]
}

/** POST /api/storefront/enquiries request body (see SendInquiryButton). */
export type CreateEnquiryInput = {
  title?: string
  requirement: string
  sourceType: EnquirySourceType
  sourcingThreadId?: string | null
  productHandle?: string | null
  productId?: string | null
  productTitle?: string
  sellerId?: string | null
  sellerName?: string
  sellerEmail?: string
}

export type EnquiryListPayload = {
  status: boolean
  data?: {
    items: Enquiry[]
    pagination?: { total: number }
  }
  msg?: string
}

export type EnquiryDetailPayload = {
  status: boolean
  data?: Enquiry
  msg?: string
}

export type QuotePortalPayload = {
  status: boolean
  data?: {
    enquiryId: string
    title: string
    requirement: string
    buyerName?: string
    productTitle?: string
    sellerName?: string
    alreadySubmitted?: boolean
    quotedAmount?: number | null
    quotedCurrency?: string
    quoteNotes?: string
  }
  msg?: string
}
