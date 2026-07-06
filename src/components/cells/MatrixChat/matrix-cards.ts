/**
 * Commerce message schemas for tese marketplace chat (Matrix custom msgtypes).
 *
 * COPY RULE: this file is intentionally dependency-free and must stay
 * byte-identical across vendor-panel, b2c-marketplace-storefront and
 * admin-panel. Edit it in one app, copy to the others.
 *
 * All card messages are regular `m.room.message` events with a custom
 * msgtype and a human-readable `body` fallback — clients that don't know
 * the msgtype render the body text (per the Matrix spec).
 */

export const PRODUCT_CARD_MSGTYPE = 'io.tese.product_card'
export const QUOTATION_MSGTYPE = 'io.tese.quotation'
export const QUOTE_RESPONSE_MSGTYPE = 'io.tese.quote_response'

export const PRODUCT_CARD_KEY = 'io.tese.card'
export const QUOTATION_KEY = 'io.tese.quotation'
export const QUOTE_RESPONSE_KEY = 'io.tese.quote_response'

/** Room state event type carrying the product the room was opened about. */
export const ROOM_CONTEXT_EVENT_TYPE = 'io.tese.room.context'

export type ProductCardPayload = {
  version: 1
  product: {
    id: string
    title: string
    handle: string
    thumbnail?: string
    price?: { amount: number; currency_code: string; formatted: string }
    variant_id?: string
    seller_id?: string
  }
}

export type QuotationItem = {
  title: string
  quantity: number
  unit_amount: number
}

export type QuotationPayload = {
  version: 1
  quote_id: string
  amount: number
  currency_code: string
  items?: QuotationItem[]
  moq?: string
  lead_time?: string
  payment_terms?: string
  /** ISO date, e.g. "2026-07-31" */
  valid_until?: string
  notes?: string
  enquiry_id?: string
  seller_id?: string
}

export type QuoteResponsePayload = {
  version: 1
  quote_id: string
  status: 'accepted' | 'declined'
  note?: string
}

type AnyContent = Record<string, any> | undefined | null

export const formatCardAmount = (
  amount: number,
  currencyCode: string
): string => {
  try {
    return new Intl.NumberFormat([], {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount} ${currencyCode.toUpperCase()}`
  }
}

/* ------------------------------------------------------------------ */
/* Guards — defensive against malformed/foreign events                 */
/* ------------------------------------------------------------------ */

export const getProductCard = (
  content: AnyContent
): ProductCardPayload | null => {
  if (!content || content.msgtype !== PRODUCT_CARD_MSGTYPE) return null
  const payload = content[PRODUCT_CARD_KEY]
  if (!payload || payload.version !== 1 || !payload.product?.id) return null
  return payload as ProductCardPayload
}

export const getQuotation = (content: AnyContent): QuotationPayload | null => {
  if (!content || content.msgtype !== QUOTATION_MSGTYPE) return null
  const payload = content[QUOTATION_KEY]
  if (
    !payload ||
    payload.version !== 1 ||
    !payload.quote_id ||
    typeof payload.amount !== 'number' ||
    !payload.currency_code
  ) {
    return null
  }
  return payload as QuotationPayload
}

export const getQuoteResponse = (
  content: AnyContent
): QuoteResponsePayload | null => {
  if (!content || content.msgtype !== QUOTE_RESPONSE_MSGTYPE) return null
  const payload = content[QUOTE_RESPONSE_KEY]
  if (!payload || payload.version !== 1 || !payload.quote_id) return null
  if (payload.status !== 'accepted' && payload.status !== 'declined') {
    return null
  }
  return payload as QuoteResponsePayload
}

export const isCardContent = (content: AnyContent): boolean =>
  !!(getProductCard(content) || getQuotation(content))

/* ------------------------------------------------------------------ */
/* Builders — used by the sending side                                 */
/* ------------------------------------------------------------------ */

export const buildProductCardContent = (
  product: ProductCardPayload['product']
) => ({
  msgtype: PRODUCT_CARD_MSGTYPE,
  body: `📦 Product: ${product.title}${
    product.price ? ` — ${product.price.formatted}` : ''
  }`,
  [PRODUCT_CARD_KEY]: { version: 1 as const, product },
})

const formatValidUntil = (iso: string): string => {
  const date = new Date(iso)
  return isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString([], {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
}

export const buildQuotationContent = (
  quotation: Omit<QuotationPayload, 'version' | 'quote_id'> & {
    quote_id?: string
  }
) => {
  const quote_id =
    quotation.quote_id ||
    `q_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  const formatted = formatCardAmount(quotation.amount, quotation.currency_code)

  return {
    msgtype: QUOTATION_MSGTYPE,
    body: `💰 Quotation: ${formatted}${
      quotation.valid_until
        ? ` — valid until ${formatValidUntil(quotation.valid_until)}`
        : ''
    }`,
    [QUOTATION_KEY]: { ...quotation, version: 1 as const, quote_id },
  }
}

export const buildQuoteResponseContent = (
  quoteId: string,
  status: QuoteResponsePayload['status'],
  quotationEventId?: string,
  note?: string
) => ({
  msgtype: QUOTE_RESPONSE_MSGTYPE,
  body: status === 'accepted' ? '✅ Quotation accepted' : '❌ Quotation declined',
  [QUOTE_RESPONSE_KEY]: { version: 1 as const, quote_id: quoteId, status, note },
  ...(quotationEventId
    ? {
        'm.relates_to': {
          rel_type: 'm.reference',
          event_id: quotationEventId,
        },
      }
    : {}),
})

/* ------------------------------------------------------------------ */
/* Inbox preview                                                       */
/* ------------------------------------------------------------------ */

export const messagePreview = (content: AnyContent): string => {
  if (!content) return ''
  const productCard = getProductCard(content)
  if (productCard) return `📦 Product: ${productCard.product.title}`
  const quotation = getQuotation(content)
  if (quotation) {
    return `💰 Quotation: ${formatCardAmount(
      quotation.amount,
      quotation.currency_code
    )}`
  }
  const response = getQuoteResponse(content)
  if (response) {
    return response.status === 'accepted'
      ? '✅ Quotation accepted'
      : '❌ Quotation declined'
  }
  if (content.msgtype === 'm.text') return content.body || ''
  return `📎 ${content.body || 'Attachment'}`
}
