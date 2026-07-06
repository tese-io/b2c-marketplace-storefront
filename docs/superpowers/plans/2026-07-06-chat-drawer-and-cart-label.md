# Chat Drawer + Cart Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the mislabeled "Add to quote cart" button to "Add to cart", and replace the header-clipped centered chat Modal with a right-side chat drawer that shows the seller's identity.

**Architecture:** Pure storefront (Next.js App Router) UI change. A new `ChatDrawer` client component provides a full-height right-docked overlay (`z-50`, above the `z-40` sticky header) with a seller header; the existing `Chat` entry component renders it instead of the generic `Modal`, and `ChatBox` fills the drawer height. No backend, no data-flow, no dependency changes.

**Tech Stack:** Next.js 14 App Router, React client components, Tailwind (project design tokens), `matrix-js-sdk` (unchanged, inside `MatrixChat`).

## Global Constraints

- No new npm dependencies. Reuse existing primitives: `Avatar` (`@/components/atoms`), `LocalizedClientLink` (`@/components/molecules/LocalizedLink/LocalizedLink`), `CloseIcon` (`@/icons`), `cn` (`@/lib/utils`).
- The drawer overlay MUST be `z-50` (the sticky header is `z-40` in `src/components/organisms/Header/Header.tsx:36`; anything ≤ z-40 gets clipped).
- Do NOT modify `src/components/molecules/Modal/Modal.tsx` — other features still use it.
- Do NOT modify `MatrixChat.tsx` or the `/user/messages` inbox.
- The repo has no React-component (RTL/jsdom) test harness — only pure-logic vitest `.test.ts`. Do NOT add an RTL harness. Verify UI tasks in the browser with the Playwright MCP tools against the running staging stack.
- Staging test login (customer): `matrix-test@tese.io` / `secret123`. Storefront: `http://localhost:3000`. A known product with a seller: `/pl/products/polypropylene-woven-bags` (seller: EuroMaterials Trading).
- Commit after each task.

---

### Task 1: Rename "Add to quote cart" → "Add to cart"

**Files:**
- Modify: `src/components/organisms/B2BProductPurchasePanel/B2BProductPurchasePanel.tsx` (the button label ternary, ~line 196-200)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Change the label**

In `src/components/organisms/B2BProductPurchasePanel/B2BProductPurchasePanel.tsx`, find the button label ternary inside the `Button` with `data-testid="product-add-to-cart-button"`:

```tsx
          {!hasAnyPrice
            ? 'Not available in region'
            : variantStock && variantHasPrice
              ? 'Add to quote cart'
              : 'Out of stock'}
```

Change the middle branch string only:

```tsx
          {!hasAnyPrice
            ? 'Not available in region'
            : variantStock && variantHasPrice
              ? 'Add to cart'
              : 'Out of stock'}
```

Do not touch `handleAddToCart` or any other line.

- [ ] **Step 2: Verify in the browser**

Ensure the storefront is running (`pm2 restart tese-storefront` if needed; it hot-reloads on save). Then with the Playwright MCP tools:
- Navigate to `http://localhost:3000/pl/products/polypropylene-woven-bags`.
- Evaluate: read `document.querySelector('[data-testid="product-add-to-cart-button"]').textContent.trim()`.
- Expected: `Add to cart` (for a priced+in-stock variant). If the product is unpriced in the region it may read "Not available in region" — that's fine; pick a priced product/variant to confirm the renamed branch.

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/organisms/B2BProductPurchasePanel/B2BProductPurchasePanel.tsx
git commit -m "Rename misleading 'Add to quote cart' button to 'Add to cart'

The button's handler adds to the normal Medusa cart; there is no quote
basket. Make the label match the behavior."
```

---

### Task 2: Chat drawer replaces the centered Modal

**Files:**
- Create: `src/components/organisms/Chat/ChatDrawer.tsx`
- Modify: `src/components/organisms/Chat/Chat.tsx` (swap `Modal` for `ChatDrawer`)
- Modify: `src/components/cells/ChatBox/ChatBox.tsx` (fill height: `h-[500px]` → `h-full`)

**Interfaces:**
- Consumes: `ChatBox` from `@/components/cells/ChatBox/ChatBox` (props `{ seller_id: string; context_id?: string; subject?: string | null }`); `Avatar` from `@/components/atoms` (props `{ src?, initials?, size?, alt?, className? }`); `LocalizedClientLink` (default export); `CloseIcon` from `@/icons` (prop `size`); `SellerProps` from `@/types/seller` (has `id`, `name`, `photo`, `handle`).
- Produces: `ChatDrawer` — `export function ChatDrawer(props: { open: boolean; onClose: () => void; seller: SellerProps; seller_id: string; context_id?: string; subject?: string | null }): JSX.Element | null`.

- [ ] **Step 1: Create `ChatDrawer.tsx`**

Create `src/components/organisms/Chat/ChatDrawer.tsx` with exactly:

```tsx
'use client';

import { useEffect } from 'react';

import { Avatar } from '@/components/atoms';
import { ChatBox } from '@/components/cells/ChatBox/ChatBox';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { CloseIcon } from '@/icons';
import { SellerProps } from '@/types/seller';

const initialsOf = (name?: string) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';

/**
 * Right-side "Write to seller" chat drawer. Overlays at z-50 (above the
 * sticky z-40 header, so nothing clips), full height, docked right. Owns the
 * seller-identity header; the conversation itself is the shared ChatBox.
 */
export function ChatDrawer({
  open,
  onClose,
  seller,
  seller_id,
  context_id,
  subject,
}: {
  open: boolean;
  onClose: () => void;
  seller: SellerProps;
  seller_id: string;
  context_id?: string;
  subject?: string | null;
}) {
  // Esc closes; lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      data-testid="chat-drawer"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="chat-drawer-backdrop"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-primary shadow-2xl">
        <div className="flex items-start gap-3 border-b p-4">
          <Avatar
            src={seller.photo || undefined}
            initials={initialsOf(seller.name)}
            size="large"
            alt={seller.name}
          />
          <div className="min-w-0 flex-1">
            <p className="label-lg truncate text-primary">{seller.name}</p>
            <p className="label-sm text-secondary">Verified supplier</p>
            {subject && (
              <p className="label-sm mt-0.5 truncate text-secondary">
                Re: {subject}
              </p>
            )}
            {seller.handle && (
              <LocalizedClientLink
                href={`/sellers/${seller.handle}`}
                className="label-sm mt-1 inline-block text-tese-ice hover:underline"
              >
                View supplier
              </LocalizedClientLink>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="shrink-0 text-secondary hover:text-primary"
            data-testid="chat-drawer-close"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 px-4 pb-4 pt-2">
          <ChatBox
            seller_id={seller_id}
            context_id={context_id}
            subject={subject}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Make `ChatBox` fill the drawer height**

In `src/components/cells/ChatBox/ChatBox.tsx`, replace every `h-[500px]` with `h-full` (three occurrences: the `failed` state wrapper, the loading state wrapper, and the final mounted wrapper). For example the final return changes from:

```tsx
  return (
    <div className="h-[500px] w-full">
      <MatrixChat roomId={roomId} className="h-full" />
    </div>
  );
```

to:

```tsx
  return (
    <div className="h-full w-full">
      <MatrixChat roomId={roomId} className="h-full" />
    </div>
  );
```

Apply the same `h-[500px]` → `h-full` change to the two centered `failed` / loading wrappers above it. Nothing else changes.

- [ ] **Step 3: Wire `ChatDrawer` into `Chat.tsx`**

In `src/components/organisms/Chat/Chat.tsx`:

Remove the Modal import:

```tsx
import { Modal } from '@/components/molecules';
```

Add the drawer import (with the other local imports):

```tsx
import { ChatDrawer } from './ChatDrawer';
```

Replace the entire `{modal && ( ... )}` block:

```tsx
      {modal && (
        <Modal
          heading="Chat"
          onClose={() => setModal(false)}
        >
          <div className="px-4">
            <ChatBox
              seller_id={seller.id}
              context_id={product?.id || order_id}
              subject={subject || product?.title || null}
            />
          </div>
        </Modal>
      )}
```

with:

```tsx
      <ChatDrawer
        open={modal}
        onClose={() => setModal(false)}
        seller={seller}
        seller_id={seller.id}
        context_id={product?.id || order_id}
        subject={subject || product?.title || null}
      />
```

The `ChatBox` import stays (still referenced by `ChatDrawer`, but `Chat.tsx` no longer uses it directly — remove the now-unused `ChatBox` import from `Chat.tsx` to avoid a lint error):

Remove from `Chat.tsx`:

```tsx
import { ChatBox } from '@/components/cells/ChatBox/ChatBox';
```

- [ ] **Step 4: Typecheck the changed files**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "Chat/ChatDrawer|Chat/Chat.tsx|ChatBox" | head
```
Expected: no output (the repo has pre-existing unrelated `@medusajs/types` resolution errors elsewhere; only lines matching these three files indicate a real problem).

- [ ] **Step 5: Verify the drawer in the browser**

Restart if needed (`pm2 restart tese-storefront`; hot-reload otherwise). With the Playwright MCP tools:
1. Log in as the customer: navigate `http://localhost:3000/pl/login`, fill `login-email-input` = `matrix-test@tese.io`, `login-password-input` = `secret123`, click `login-submit-button`; expect to land on `/pl/user`.
2. Navigate `http://localhost:3000/pl/products/polypropylene-woven-bags`.
3. Click the "Write to seller" button (the `Chat` button; text "Write to seller").
4. Assert via evaluate:
   - `document.querySelector('[data-testid="chat-drawer"]')` exists.
   - Panel `getBoundingClientRect().top` is `0` (full height, not clipped under the header) and `right` equals `window.innerWidth`.
   - Header shows the seller name (`EuroMaterials Trading`) and "Verified supplier".
   - `document.body.style.overflow === 'hidden'` while open.
5. Type a message in the composer and Send; confirm it appears in the thread (the drawer body is the existing `MatrixChat`).
6. Close via the X (`chat-drawer-close`); assert `[data-testid="chat-drawer"]` is gone and `document.body.style.overflow` is restored. Re-open and close via backdrop click (`chat-drawer-backdrop`) and via Escape key; both close.
7. Take a screenshot for a visual check (seller header present, full-height panel, product visible behind the dim backdrop).

- [ ] **Step 6: Verify a second entry point**

Navigate to the seller page (`View supplier` link target, e.g. `http://localhost:3000/pl/sellers/<handle>`) and trigger its "Write to seller" action; confirm the same drawer opens. (All four `Chat` callers share this component, so one more spot-check is sufficient.)

- [ ] **Step 7: Commit**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/organisms/Chat/ChatDrawer.tsx \
        src/components/organisms/Chat/Chat.tsx \
        src/components/cells/ChatBox/ChatBox.tsx
git commit -m "Replace header-clipped chat Modal with a right-side ChatDrawer

The 'Write to seller' chat used the generic Modal (z-30), which the
sticky z-40 header rendered over, clipping its title bar. New ChatDrawer
is a full-height right-docked overlay at z-50 with a proper seller header
(avatar, name, 'Verified supplier', 'Re: <product>', View supplier) and
close via X / backdrop / Esc, with background scroll locked. ChatBox
fills the drawer height. All four Chat entry points inherit it."
```

---

## Self-Review

**Spec coverage:**
- Cart rename → Task 1. ✓
- Drawer overlay z-50 above header → Task 2 Step 1 (`fixed inset-0 z-50`). ✓
- Full-height right panel, no clipping → Task 2 Step 1 (`absolute right-0 top-0 h-full`), verified Step 5. ✓
- Seller header (avatar, name, verified, Re:, View supplier, close) → Task 2 Step 1. ✓
- ChatBox fills height → Task 2 Step 2. ✓
- Chat.tsx swaps Modal → Task 2 Step 3. ✓
- Modal.tsx / MatrixChat / inbox untouched → not modified; called out in Global Constraints. ✓
- Esc + backdrop + scroll-lock → Task 2 Step 1, verified Step 5. ✓
- Verify rename + second entry point → Task 1 Step 2, Task 2 Step 6. ✓

**Placeholder scan:** none — full code and exact commands throughout.

**Type consistency:** `ChatDrawer` prop names/types in Step 1 match the invocation in Step 3 (`open`, `onClose`, `seller`, `seller_id`, `context_id`, `subject`). `ChatBox` props (`seller_id`, `context_id`, `subject`) match its definition. `Avatar` props (`src`, `initials`, `size`, `alt`) match the atom. `SellerProps` fields used (`id`, `name`, `photo`, `handle`) exist.
