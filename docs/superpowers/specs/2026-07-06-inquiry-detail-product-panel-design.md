# Inquiry detail — product image & details panel

## Context

The inquiry detail page (`/sourcing/inquiries/[id]`, `InquiryDetail.tsx`) shows the RFQ
title, requirement, status, and supplier quotes, but no product thumbnail or catalog
specs. Buyers opening a product-page quote request (e.g. "Quote request: Recycled Cotton
Yarn") cannot see what they asked about without navigating back to the PDP.

This spec extends the existing inquiry detail design
(`2026-07-06-inquiry-detail-and-chat-design.md`) with a **product strip** inside the hero
card. No tese-backend changes.

## Goals

- Show product **thumbnail**, **title**, **category**, and **metadata pills** (MOQ, unit,
  origin, lead time, certifications) when the enquiry is tied to a product.
- Surface **request details** (quantity, material, region) from `structuredRequirement`
  when present, or parse quantity from requirement text as fallback.
- Link to the PDP (`View product →`).
- Preserve all existing behaviour: quotes, Message seller, Accept → cart.

## Non-goals

- Backend persistence of thumbnails on enquiries.
- Multi-product comparison UI beyond a small per-quote thumbnail when handles differ.
- Editing the enquiry or product from this page.

---

## Layout (approved)

### Single product (typical `product_page` RFQ)

All targets share one `productHandle`. Hero card becomes a two-part layout:

1. **Product strip** (top): horizontal row — thumbnail | title + category + meta pills |
   "View product →" link.
2. **Request block** (below divider): full requirement text + created date. Title and
   status badge remain in the strip header row.

```
← Inquiries

┌─ Hero ──────────────────────────────────────────────────┐
│ [96×96]  Product title                          [OPEN]  │
│          Category · MOQ · Unit pills                    │
│          View product →                                  │
│ ─────────────────────────────────────────────────────── │
│ Requesting a quote for … Quantity: 342.                 │
│ 6 Jul 2025                                               │
└─────────────────────────────────────────────────────────┘

Quotes …
```

### Multiple products

When targets have **different** `productHandle` values:

- Hero shows the **first target with a handle** as the primary product strip.
- Each quote card that references a **different** handle gets a small **40×40**
  thumbnail beside `productTitle` (reuse fetched product map).

### No product

When no target has `productHandle`, hide the product strip entirely. Hero stays as today
(title, status, requirement, date only).

### Container width

Increase `.tese-inquiry-detail` max-width from `52rem` to `min(64rem, 100%)` so the
horizontal strip has room without shrinking quote cards.

### Responsive

| Breakpoint | Product strip |
|------------|---------------|
| `<768px` | Stack: image full-width (max 120px height, aspect-ratio 1), text below |
| `≥768px` | Horizontal: fixed 96×96 thumbnail left, content right |

Image uses `aspect-ratio: 1` and `object-fit: cover` to prevent CLS. Skeleton reserves
96×96 (or full-width mobile box) while loading.

---

## Data

### Already on enquiry (from tese-backend)

Extend `Enquiry` in `src/types/enquiry.ts`:

```ts
export type StructuredRequirement = {
  material?: string
  grade?: string
  quantity?: string
  unit?: string
  region?: string
  certifications?: string[]
}

export type EnquirySource = {
  type?: EnquirySourceType
  sessionId?: string | null
  query?: string
  sourcingThreadId?: string | null
}

export type Enquiry = {
  // …existing fields…
  structuredRequirement?: StructuredRequirement
  source?: EnquirySource
}
```

Backend already returns these fields; the storefront types just omit them today.

### Fetched from Medusa (after enquiry load)

For each unique non-null `productHandle` across `enquiry.targets`, fetch one product via
the existing `listProducts` server action:

```ts
listProducts({
  countryCode: locale, // from useParams().locale
  queryParams: { handle: [handle], limit: 1 },
})
```

Map to a lightweight client type:

```ts
type InquiryProductSummary = {
  handle: string
  title: string
  thumbnail?: string | null
  category?: string
  metadata?: Record<string, unknown>
  priceLabel?: string | null // formatted list price when variant price exists
}
```

Metadata pill keys match `SourcingWorkspace` `MetaRow`: `unit`, `moq`, `origin`,
`lead_time_days`, `certifications`.

### Request detail pills (enquiry-side)

Show non-empty `structuredRequirement` fields as pills below product meta when they add
information not already shown:

| Field | Label |
|-------|-------|
| `quantity` | Qty |
| `unit` | Unit (skip if same as product metadata unit) |
| `material` | Material |
| `grade` | Grade |
| `region` | Region |
| `certifications` | Certifications (comma-joined) |

**Fallback:** if `structuredRequirement.quantity` is empty, regex-parse
`Quantity:\s*([^.]+)` from `requirement` and show as a Qty pill.

`RequestQuoteButton` today embeds quantity only in requirement text, not
`structuredRequirement`, so the fallback is required for product-page RFQs.

---

## Components / files

### 1. `src/lib/helpers/inquiry-product.ts` (new)

Pure helpers (testable without React):

- `uniqueProductHandles(targets: EnquiryTarget[]): string[]`
- `parseQuantityFromRequirement(requirement: string): string | null`
- `buildRequirementPills(structured, requirement, productMeta?): { label, value }[]`
- `productSummaryFromMedusa(product): InquiryProductSummary`

### 2. `src/components/sections/SourcingInquiries/InquiryProductStrip.tsx` (new)

Presentational component:

```tsx
<InquiryProductStrip
  product={InquiryProductSummary | null}
  loading={boolean}
  requirementPills={…}
  statusBadge={…}  // or parent renders status in strip header
  productHref={`/products/${handle}`}
/>
```

Uses `LocalizedClientLink`, Next.js `Image` (or `img` with eslint exemption matching
SourcingWorkspace if CDN domains aren't in next.config — follow existing pattern).

### 3. `src/components/sections/SourcingInquiries/InquiryDetail.tsx` (modify)

After enquiry fetch succeeds:

1. Collect unique handles from targets.
2. If any, `Promise.all` fetch products by handle (parallel, deduped).
3. Build `productsByHandle: Map<string, InquiryProductSummary>`.
4. Primary handle = first target with `productHandle`.
5. Render `InquiryProductStrip` inside hero when primary exists.
6. Pass `productsByHandle.get(t.productHandle)?.thumbnail` into quote cards when handle
   differs from primary or for all cards (optional small thumb beside product title).

Loading states:

- Enquiry skeleton unchanged.
- Product strip shows image skeleton + 2 text skeleton lines while products fetch; requirement
  block renders immediately once enquiry is loaded.

### 4. `src/types/enquiry.ts` (modify)

Add `StructuredRequirement`, `EnquirySource`, extend `Enquiry`.

### 5. `src/app/globals.css` (modify)

New classes under `.tese-inquiry-detail`:

- `.tese-inquiry-detail-hero--with-product` — flex column with divider
- `.tese-inquiry-product-strip`, `__media`, `__body`, `__title`, `__category`,
  `__pills`, `__link`
- `.tese-inquiry-product-skeleton`
- `.tese-inquiry-quote-product-thumb` — 40×40 in quote cards
- Bump container `max-width` to `64rem`

Reuse existing tokens: `--tese-lime`, `--tese-ink`, `--tese-surface`, pill styling aligned
with `MetaRow` / `.tese-inquiry-status`.

---

## Error handling

| Case | Behaviour |
|------|-----------|
| Product fetch fails for a handle | Omit thumbnail; show `productTitle` from target; meta pills from enquiry only; no broken image icon |
| Product not found (empty Medusa response) | Same as above — graceful text-only strip |
| No `productHandle` on any target | No strip; page unchanged from current |
| Missing locale | Default to `'us'` or read from `useParams` with fallback `'en'` matching other workspace pages |

Product fetch errors must not block quotes section or chat/accept actions.

---

## Accessibility & performance

- Product image: meaningful `alt={product.title}`.
- `View product →` is a text link with visible focus ring (existing `.tese-inquiry-detail-back` pattern).
- Image dimensions reserved (CLS < 0.1).
- `loading="lazy"` on thumbnail (below fold on mobile after title — acceptable).
- `prefers-reduced-motion`: no new animations beyond existing hero enter.

---

## Verification

1. Open a **product-page** RFQ detail (e.g. cotton yarn) → hero shows thumbnail, title,
   category/meta pills, parsed quantity pill, View product link, requirement below.
2. Click **View product →** → PDP for that handle.
3. **Quotes section** unchanged: price, notes, Message seller, Accept → cart.
4. Enquiry with **no product handle** → no product strip; page looks as before.
5. Enquiry with **multiple different handles** → primary in hero; per-quote thumbs where
   applicable.
6. Product fetch failure → text-only strip, no console error surfaced to user.
7. Mobile 375px → stacked layout, no horizontal scroll.
8. `npm test` — unit tests for `inquiry-product.ts` helpers (parse quantity, unique handles,
   pill builder).

---

## Relation to prior spec

Builds on `2026-07-06-inquiry-detail-and-chat-design.md`. Does not change GET proxy, accept
flow, ChatDrawer integration, or list page behaviour.
