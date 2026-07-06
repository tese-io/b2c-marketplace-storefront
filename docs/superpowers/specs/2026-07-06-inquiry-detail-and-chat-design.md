# Inquiry detail page + go-to-chat — design

## Context

The buyer's Inquiries page (`/sourcing/inquiries`, `SourcingInquiriesList.tsx`) lists
each RFQ as a flat card: title, a 2-line requirement, per-target status, and an
"Accept → cart" button when a target is quoted. Two gaps:

1. **The actual quote is hidden.** Each target already carries `quotedAmount`,
   `quotedCurrency`, and `quoteNotes` (see `src/types/enquiry.ts`), but the card
   shows only the status word — a buyer can't see the price or the seller's notes
   before accepting.
2. **No chat entry.** There's no way to message the seller about an enquiry from
   here; the buyer must navigate back to the product page.

Chosen solution (confirmed with the user): a **dedicated detail page** at
`/sourcing/inquiries/[id]` that shows the full enquiry and its quotes, with a
**Message seller** action that reuses the existing `ChatDrawer` and an
**Accept → cart** action that reuses the existing accept flow.

## Data

`getEnquiryById(enquiryId, medusaCustomerId)` (tese-backend) already exists and is
exposed at `GET /api/v3/storefront/enquiries/:id`, returning
`{ status: true, data: <Enquiry>, msg }` scoped to the buyer's own record — so the
buyer sees **all** targets/quotes (correct; the seller-scoped list hides rivals, the
buyer's own detail does not). The `Enquiry` and `EnquiryTarget` types
(`src/types/enquiry.ts`) already model every field needed. No tese-backend change.

## Components / files

1. **`src/app/api/storefront/enquiries/[id]/route.ts`** (new) — GET proxy mirroring
   the list proxy (`src/app/api/storefront/enquiries/route.ts`):
   ```ts
   export const dynamic = 'force-dynamic'
   export async function GET(_req, { params }) {
     const { id } = await params
     const { ok, status, json } = await storefrontBffFetch(`/enquiries/${id}`, { method: 'GET' })
     return NextResponse.json(json, { status: ok ? 200 : status })
   }
   ```
   `storefrontBffFetch` carries the customer BFF auth, so the backend scopes to the
   caller's own enquiry.

2. **`src/app/[locale]/(workspace)/sourcing/inquiries/[id]/page.tsx`** (new) — the
   route. Reads the `id` param and renders `<InquiryDetail enquiryId={id} />`. The
   workspace layout already wraps children in `MatrixProvider`
   (`(workspace)/layout.tsx:45`), so the embedded `ChatDrawer → MatrixChat` has
   Matrix context.

3. **`src/components/sections/SourcingInquiries/InquiryDetail.tsx`** (new, `'use client'`) —
   fetches `/api/storefront/enquiries/${enquiryId}` on mount and renders:
   - Back link → `/sourcing/inquiries` ("← Inquiries").
   - Header: `title` + status badge (`enquiryStatusLabel(status)`).
   - Full `requirement` (not clamped) + created date.
   - **Quotes section** — one block per `target`:
     - seller name (`sellerName`) + product (`productTitle`),
     - target status badge,
     - **the quote** when present: `convertToLocale({ amount: quotedAmount, currency_code: quotedCurrency })` + `quoteNotes`,
     - actions:
       - **Message seller** button → opens `ChatDrawer` with
         `seller_id={target.sellerId}`, `context_id={target.productId ?? undefined}`,
         `subject={target.productTitle ?? title}`. Because `context_id` is the
         product id, this resolves to the **same deterministic room** as the
         product-page "Write to seller" chat, so the buyer continues that thread
         (and sees the seller's quotation cards). Disabled when `target.sellerId`
         is missing.
       - **Accept → cart** button (only when `target.status === 'quoted'` and
         `target._id`) → `POST /api/storefront/enquiries/${enquiryId}/accept`
         with `{ targetId }`; on `{ data.checkoutPath }` redirect there (same as the
         list's `acceptQuote`).
   - Manages `chatTarget` state (which target's chat is open) + a single
     `ChatDrawer` instance; `onClose` clears it.
   - States: loading skeleton; `401`/"Sign in to continue" → sign-in prompt
     (mirror the list's `needsAuth` block); missing/`status:false` → "Inquiry not
     found" + back link.

4. **`src/components/sections/SourcingInquiries/SourcingInquiriesList.tsx`** (modify) —
   add a **"View details →"** `LocalizedClientLink` to
   `/sourcing/inquiries/${item.enquiryId}` in each card (e.g. next to the date).
   Keep the existing inline Send RFQ / Accept buttons unchanged (avoids
   nested-interactive markup — the card is not itself wrapped in a link).

5. **`src/types/enquiry.ts`** (modify) — add an `EnquiryDetailPayload` type:
   `{ status: boolean; msg?: string; data?: Enquiry }` for the detail fetch.

## Isolation / boundaries

- `InquiryDetail` owns all detail rendering + the chat/accept actions; depends on
  the enquiry types, `convertToLocale`, `ChatDrawer`, `LocalizedClientLink`.
  Testable by driving the page in the browser against a quoted enquiry.
- The GET proxy is a thin pass-through, symmetric with the existing list/accept
  proxies.
- `ChatDrawer` and the accept endpoint are reused unchanged — no new chat or
  cart logic.

## Verification (staging, logged-in buyer with a quoted enquiry)

1. `/sourcing/inquiries` → each card shows a "View details →" link.
2. Click it → detail page shows the full requirement, seller name + product, the
   **quoted price** (formatted) and **notes**, and the status.
3. **Message seller** → `ChatDrawer` opens for that seller; it is the same room as
   the product-page chat (prior messages/quotation cards visible); sending works;
   close works.
4. **Accept → cart** on a quoted target → redirects to the checkout path.
5. Deep-link `/sourcing/inquiries/<id>` directly (fresh load) → renders the detail.
6. Signed-out → sign-in prompt; unknown id → not-found state.

## Non-goals

Editing/cancelling enquiries, multi-quote comparison UI beyond a simple stacked
list, seller-side changes, and any change to the enquiry list's existing inline
Send RFQ / Accept behavior.
