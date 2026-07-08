# Inquiry Detail Page + Go-to-Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dedicated buyer-side inquiry detail page at `/sourcing/inquiries/[id]` that shows each RFQ's full requirement and per-seller quotes (price + notes), with "Message seller" (reusing the existing ChatDrawer) and "Accept → cart" actions, reachable via a "View details →" link on the inquiries list.

**Architecture:** Pure storefront (Next.js App Router). A thin GET-by-id proxy forwards to the existing tese-backend `GET /enquiries/:id`. A client `InquiryDetail` component fetches that and renders the enquiry + quotes; "Message seller" opens the already-built `ChatDrawer` scoped to the target's seller + product (same deterministic room as the product-page chat). No tese-backend changes.

**Tech Stack:** Next.js 14 App Router, React client components, Tailwind (project tokens), the existing `storefrontBffFetch` proxy helper and `ChatDrawer`.

## Global Constraints

- No new npm dependencies. Reuse: `storefrontBffFetch` (`@/lib/storefront-bff`), `ChatDrawer` (`@/components/organisms/Chat/ChatDrawer`), `LocalizedClientLink` (`@/components/molecules/LocalizedLink/LocalizedLink`), `convertToLocale` (`@/lib/helpers/money`, object arg `{ amount, currency_code }`), `enquiryStatusLabel` + types from `@/types/enquiry`.
- Do NOT modify tese-backend, `ChatDrawer.tsx`, or any file the concurrent inbox redesign owns (`MatrixChat.tsx`, `MatrixInbox.tsx`, `MessageCards.tsx`, `UserMessagesSection.tsx`, `globals.css`, `SourcingWorkspace.tsx`, `user/messages/page.tsx`). Keep every commit scoped to only this plan's files; never `git add -A`.
- App Router route params are a Promise — always `const { id } = await params` (matches `enquiries/[id]/accept/route.ts` and the layouts).
- The repo has no React-component test harness (only pure-logic vitest). Do NOT add one; verify UI in the browser with the Playwright MCP tools. In this session the controller performs browser verification; implementers do the edit + typecheck + scoped commit.
- Staging: storefront `http://localhost:3000`; buyer login `matrix-test@tese.io` / `secret123`. A quoted enquiry owned by this buyer exists: `sfe-mr7bsqjm-dfdf984c` ("Copper Cathode (LME Grade A)", status quoted, target seller quote 8500 EUR). Use it (or any quoted enquiry the logged-in buyer owns) for verification.
- `ChatDrawer` props (unchanged): `{ open: boolean; onClose: () => void; seller_id: string; context_id?: string; subject?: string | null }`.
- Commit after each task.

---

### Task 1: GET-by-id enquiry proxy + detail payload type

**Files:**
- Create: `src/app/api/storefront/enquiries/[id]/route.ts`
- Modify: `src/types/enquiry.ts` (add `EnquiryDetailPayload`)

**Interfaces:**
- Consumes: `storefrontBffFetch(path, init) => { ok, status, json }` (existing).
- Produces: `GET /api/storefront/enquiries/:id → { status: boolean; data?: Enquiry; msg?: string }`; TS type `EnquiryDetailPayload` exported from `@/types/enquiry`.

- [ ] **Step 1: Add the `EnquiryDetailPayload` type**

In `src/types/enquiry.ts`, immediately after the existing `EnquiryListPayload` type (the block ending with its closing `}`), add:

```ts
export type EnquiryDetailPayload = {
  status: boolean
  data?: Enquiry
  msg?: string
}
```

- [ ] **Step 2: Create the GET proxy**

Create `src/app/api/storefront/enquiries/[id]/route.ts` with exactly:

```ts
import { NextRequest, NextResponse } from 'next/server'

import { storefrontBffFetch } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { ok, status, json } = await storefrontBffFetch(`/enquiries/${id}`, {
    method: 'GET',
  })

  return NextResponse.json(json, { status: ok ? 200 : status })
}
```

(This coexists with the existing `enquiries/[id]/accept/route.ts` and `enquiries/[id]/send/route.ts` — a `route.ts` at the `[id]` level is the GET for that segment.)

- [ ] **Step 3: Typecheck**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "enquiries/\[id\]/route|types/enquiry" | head
```
Expected: no output.

- [ ] **Step 4: Controller browser/endpoint verification**

Controller: with the buyer logged in (`matrix-test@tese.io`), fetch the endpoint in the browser context and confirm it returns the enquiry:
- In the Playwright page (on `http://localhost:3000`), evaluate:
  `fetch('/api/storefront/enquiries/sfe-mr7bsqjm-dfdf984c').then(r=>r.json())`
- Expected: `{ status: true, data: { enquiryId: 'sfe-mr7bsqjm-dfdf984c', title, requirement, status, targets: [...] }, msg }`.

- [ ] **Step 5: Commit (scoped)**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/app/api/storefront/enquiries/[id]/route.ts src/types/enquiry.ts
git commit -m "Add GET-by-id enquiry proxy + EnquiryDetailPayload type"
```

---

### Task 2: InquiryDetail component + detail page route

**Files:**
- Create: `src/components/sections/SourcingInquiries/InquiryDetail.tsx`
- Create: `src/app/[locale]/(workspace)/sourcing/inquiries/[id]/page.tsx`

**Interfaces:**
- Consumes: `EnquiryDetailPayload`, `Enquiry`, `EnquiryTarget`, `enquiryStatusLabel` (`@/types/enquiry`); `ChatDrawer`; `convertToLocale`; `LocalizedClientLink`. `GET /api/storefront/enquiries/:id` and `POST /api/storefront/enquiries/:id/accept` (existing; accept returns `{ status, data: { checkoutPath } }`).
- Produces: `InquiryDetail({ enquiryId: string })` React component; page default export at the `[id]` route.

- [ ] **Step 1: Create `InquiryDetail.tsx`**

Create `src/components/sections/SourcingInquiries/InquiryDetail.tsx` with exactly:

```tsx
'use client'

import { useEffect, useState } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ChatDrawer } from '@/components/organisms/Chat/ChatDrawer'
import { convertToLocale } from '@/lib/helpers/money'
import {
  enquiryStatusLabel,
  type Enquiry,
  type EnquiryDetailPayload,
  type EnquiryTarget,
} from '@/types/enquiry'

export function InquiryDetail({ enquiryId }: { enquiryId: string }) {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [chatTarget, setChatTarget] = useState<EnquiryTarget | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/storefront/enquiries/${enquiryId}`)
        const json: EnquiryDetailPayload = await res.json()
        if (cancelled) return
        if (res.status === 401 || json?.msg === 'Sign in to continue') {
          setNeedsAuth(true)
          return
        }
        if (!json?.status || !json?.data) {
          setError(json?.msg || 'Inquiry not found')
          return
        }
        setEnquiry(json.data)
      } catch {
        if (!cancelled) setError('Could not load inquiry')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [enquiryId])

  async function acceptQuote(targetId: string) {
    setAccepting(targetId)
    setError(null)
    try {
      const res = await fetch(`/api/storefront/enquiries/${enquiryId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId }),
      })
      const json = await res.json()
      if (json?.status && json?.data?.checkoutPath) {
        window.location.href = json.data.checkoutPath
        return
      }
      setError(json?.msg || 'Could not accept quote')
    } catch {
      setError('Could not accept quote')
    } finally {
      setAccepting(null)
    }
  }

  const backLink = (
    <LocalizedClientLink
      href="/sourcing/inquiries"
      className="text-sm text-secondary hover:text-primary"
    >
      ← Inquiries
    </LocalizedClientLink>
  )

  if (loading) {
    return (
      <div className="tese-sourcing-loading" role="status">
        Loading inquiry…
      </div>
    )
  }

  if (needsAuth) {
    return (
      <div className="tese-sourcing-placeholder">
        <h1 className="tese-sourcing-placeholder-title">
          Sign in to view this inquiry
        </h1>
        <LocalizedClientLink
          href="/login"
          className="tese-sourcing-placeholder-cta"
        >
          Sign in
        </LocalizedClientLink>
      </div>
    )
  }

  if (error || !enquiry) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4">
        {backLink}
        <p className="mt-4 text-secondary">{error || 'Inquiry not found'}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4" data-testid="inquiry-detail">
      {backLink}

      <header className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold text-primary">{enquiry.title}</h1>
        <span className="tese-sourcing-inquiry-status shrink-0">
          {enquiryStatusLabel(enquiry.status)}
        </span>
      </header>

      <p className="mt-2 whitespace-pre-wrap text-sm text-secondary">
        {enquiry.requirement}
      </p>
      <time
        className="mt-1 block text-[11px] text-secondary"
        dateTime={enquiry.createdAt}
      >
        {new Date(enquiry.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </time>

      <h2 className="mb-2 mt-6 text-sm font-semibold text-primary">Quotes</h2>
      <ul className="flex flex-col gap-3">
        {(enquiry.targets || []).map((t) => {
          const targetId = t._id
          const quoted = t.status === 'quoted'
          return (
            <li
              key={targetId || `${t.productHandle}-${t.sellerId}`}
              className="rounded-sm border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-primary">
                    {t.sellerName || 'Supplier'}
                  </p>
                  {t.productTitle && (
                    <p className="truncate text-[13px] text-secondary">
                      {t.productTitle}
                    </p>
                  )}
                </div>
                <span className="tese-sourcing-inquiry-status shrink-0">
                  {enquiryStatusLabel(t.status || '')}
                </span>
              </div>

              {quoted && typeof t.quotedAmount === 'number' && (
                <p className="mt-2 text-lg font-semibold text-primary">
                  {convertToLocale({
                    amount: t.quotedAmount,
                    currency_code: (t.quotedCurrency || 'EUR').toLowerCase(),
                  })}
                </p>
              )}
              {t.quoteNotes && (
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-secondary">
                  {t.quoteNotes}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!t.sellerId}
                  onClick={() => setChatTarget(t)}
                  className="rounded-sm border px-3 py-1.5 text-sm disabled:opacity-50"
                  data-testid="inquiry-message-seller"
                >
                  Message seller
                </button>
                {quoted && targetId && (
                  <button
                    type="button"
                    disabled={accepting === targetId}
                    onClick={() => acceptQuote(targetId)}
                    className="bg-action text-action-on-primary rounded-sm px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {accepting === targetId ? 'Adding…' : 'Accept → cart'}
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {error && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <ChatDrawer
        open={!!chatTarget?.sellerId}
        onClose={() => setChatTarget(null)}
        seller_id={chatTarget?.sellerId || ''}
        context_id={chatTarget?.productId || undefined}
        subject={chatTarget?.productTitle || enquiry.title}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create the page route**

Create `src/app/[locale]/(workspace)/sourcing/inquiries/[id]/page.tsx` with exactly:

```tsx
import { InquiryDetail } from '@/components/sections/SourcingInquiries/InquiryDetail'

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params
  return <InquiryDetail enquiryId={id} />
}
```

- [ ] **Step 3: Typecheck**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "InquiryDetail|sourcing/inquiries/\[id\]" | head
```
Expected: no output.

- [ ] **Step 4: Controller browser verification**

Controller, buyer logged in:
1. Navigate `http://localhost:3000/pl/sourcing/inquiries/sfe-mr7bsqjm-dfdf984c`.
2. Assert `[data-testid="inquiry-detail"]` exists; the page shows the title, full requirement, and a Quotes section with the seller, the formatted amount (e.g. `€8,500.00`), and the quote notes.
3. Click `[data-testid="inquiry-message-seller"]` → the `[data-testid="chat-drawer"]` opens for that seller; send a message; confirm it appears; close it.
4. If a quoted target is present, click "Accept → cart" and confirm it navigates to the checkout path (then navigate back — don't complete checkout).
5. Deep-link the URL in a fresh navigation → still renders.

- [ ] **Step 5: Commit (scoped)**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/sections/SourcingInquiries/InquiryDetail.tsx \
        "src/app/[locale]/(workspace)/sourcing/inquiries/[id]/page.tsx"
git commit -m "Add inquiry detail page with quotes and Message seller (ChatDrawer)"
```

---

### Task 3: "View details →" link on the inquiries list

**Files:**
- Modify: `src/components/sections/SourcingInquiries/SourcingInquiriesList.tsx` (the per-card `<time>` block, ~lines 218-224)

**Interfaces:**
- Consumes: `LocalizedClientLink` (already imported at the top of this file) + the detail route from Task 2.
- Produces: nothing consumed downstream.

- [ ] **Step 1: Replace the `<time>` block with a time + link row**

In `src/components/sections/SourcingInquiries/SourcingInquiriesList.tsx`, replace this exact block:

```tsx
            <time className="block mt-3 text-[11px] text-secondary" dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
```

with:

```tsx
            <div className="mt-3 flex items-center justify-between gap-2">
              <time className="text-[11px] text-secondary" dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <LocalizedClientLink
                href={`/sourcing/inquiries/${item.enquiryId}`}
                className="text-[12px] font-medium text-tese-ink hover:underline"
              >
                View details →
              </LocalizedClientLink>
            </div>
```

(`LocalizedClientLink` is already imported in this file.)

- [ ] **Step 2: Typecheck**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "SourcingInquiriesList" | head
```
Expected: no output.

- [ ] **Step 3: Controller browser verification**

Controller, buyer logged in: navigate `http://localhost:3000/pl/sourcing/inquiries`, confirm each card has a "View details →" link, click it, and confirm it lands on the detail page from Task 2.

- [ ] **Step 4: Commit (scoped)**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/sections/SourcingInquiries/SourcingInquiriesList.tsx
git commit -m "Link inquiry list cards to the new detail page"
```

---

## Self-Review

**Spec coverage:**
- GET-by-id proxy → Task 1. ✓
- `EnquiryDetailPayload` type → Task 1. ✓
- Detail page route → Task 2. ✓
- `InquiryDetail`: full requirement, per-target quote (amount via `convertToLocale`, notes, status), Message seller (ChatDrawer with seller_id/context_id=productId/subject), Accept → cart → Task 2. ✓
- Loading / needsAuth / not-found states → Task 2. ✓
- Same room as product chat (context_id = productId) → Task 2 Step 1 (`context_id={chatTarget?.productId || undefined}`). ✓
- "View details →" list link → Task 3. ✓
- No tese-backend / ChatDrawer / redesign-file changes; scoped commits → Global Constraints. ✓

**Placeholder scan:** none — full code and exact commands.

**Type consistency:** `EnquiryDetailPayload` (Task 1) has `data?: Enquiry`, consumed in Task 2's fetch typing. `ChatDrawer` props used in Task 2 match its signature (`open`, `onClose`, `seller_id`, `context_id`, `subject`). `convertToLocale` called with `{ amount, currency_code }` (object arg, matches the helper). `EnquiryTarget` fields used (`_id`, `sellerId`, `sellerName`, `productId`, `productTitle`, `productHandle`, `status`, `quotedAmount`, `quotedCurrency`, `quoteNotes`) all exist in `@/types/enquiry`.
