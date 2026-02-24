export type RfqType = 'product' | 'service' | 'mixed'

export type RfqStatus =
  | 'draft'
  | 'submitted'
  | 'quoting'
  | 'quoted'
  | 'in_negotiation'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted'

export type RfqPriority = 'low' | 'medium' | 'high' | 'urgent'

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'in_negotiation'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'converted_to_order'

export interface RfqRequest {
  id: string
  customer_id: string
  title: string
  description: string
  rfq_type: RfqType
  status: RfqStatus
  priority: RfqPriority
  budget_min?: number
  budget_max?: number
  currency_code: string
  quantity?: number
  unit?: string
  deadline?: string
  expires_at?: string
  requirements?: string
  attachments?: string[]
  metadata?: Record<string, unknown>
  quotation_versions?: QuotationVersion[]
  created_at: string
  updated_at: string
}

export interface QuotationLineItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  currency_code: string
}

export interface QuotationTerm {
  id: string
  term_type: 'payment' | 'delivery' | 'warranty' | 'cancellation' | 'custom'
  title: string
  description: string
}

export interface QuotationVersion {
  id: string
  rfq_request_id: string
  seller_id: string
  version_number: number
  status: QuoteStatus
  total_amount: number
  currency_code: string
  valid_until?: string
  delivery_days?: number
  notes?: string
  line_items: QuotationLineItem[]
  terms: QuotationTerm[]
  parent_version_id?: string
  seller?: {
    id: string
    name: string
    photo?: string
    handle?: string
  }
  created_at: string
  updated_at: string
}

export type NegotiationThreadStatus =
  | 'active'
  | 'awaiting_buyer'
  | 'awaiting_seller'
  | 'on_hold'
  | 'closed_accepted'
  | 'closed_rejected'
  | 'closed_expired'

export type MessageType = 'text' | 'proposal' | 'counter_proposal' | 'system' | 'file_shared'

export interface NegotiationThread {
  id: string
  rfq_request_id: string
  buyer_id: string
  seller_id: string
  quotation_version_id?: string
  status: NegotiationThreadStatus
  proposal_count: number
  max_proposals: number
  talkjs_conversation_id?: string
  messages?: NegotiationMessage[]
  created_at: string
  updated_at: string
}

export interface NegotiationMessage {
  id: string
  thread_id: string
  sender_id: string
  sender_type: 'buyer' | 'seller' | 'system'
  message_type: MessageType
  content: string
  proposal_data?: Record<string, unknown>
  attachments?: string[]
  is_read: boolean
  created_at: string
}

export type EscrowStatus =
  | 'pending'
  | 'held'
  | 'partially_released'
  | 'released'
  | 'refunded'
  | 'disputed'

export interface EscrowTransaction {
  id: string
  order_id: string
  seller_id: string
  buyer_id: string
  status: EscrowStatus
  escrow_type: 'product' | 'service'
  total_amount: number
  held_amount: number
  released_amount: number
  refunded_amount: number
  currency_code: string
  created_at: string
  updated_at: string
}
