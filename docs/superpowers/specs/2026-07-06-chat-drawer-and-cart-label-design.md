# Chat drawer + cart label — design

## Context

Two problems surfaced on the storefront product page (PDP):

1. **Mislabeled cart button.** The secondary buy action reads **"Add to quote cart"**,
   but its handler (`handleAddToCart` in `B2BProductPurchasePanel.tsx`) calls the normal
   Medusa `addToCart` — the regular buy-now shopping cart. There is no separate
   "quote cart" concept anywhere in the codebase (`grep` for quote-cart returns only this
   label). On an RFQ-first marketplace this is confusing: a "quote" button silently drops
   items into checkout.

2. **Broken "Write to seller" chat.** Clicking "Write to seller" opens the generic
   `Modal` (`src/components/molecules/Modal/Modal.tsx`), which is `z-30` and positioned
   `my-20` (80px from the top). The site header is `sticky top-0 z-40` and taller than
   80px, so the header renders **above** the modal and clips its title bar — the chat
   appears as a headerless box starting mid-nav. The chat pane also shows **no seller
   identity** (just "No messages yet") and is visually plain.

Decisions (confirmed with the user):
- Cart button: **rename to "Add to cart"** — honest label, no behavior change. A real
  multi-item quote basket is out of scope (possible future feature).
- Chat: **right-side drawer** (Alibaba/Intercom pattern) — clears the header, keeps the
  product visible, feels like a persistent conversation.

## Part 1 — Cart label

`src/components/organisms/B2BProductPurchasePanel/B2BProductPurchasePanel.tsx`

Change the middle branch of the button label ternary from `'Add to quote cart'` to
`'Add to cart'`. No behavior, handler, or styling change.

## Part 2 — Chat drawer

### New component: `ChatDrawer`

`src/components/organisms/Chat/ChatDrawer.tsx` (`'use client'`), mirroring the existing
overlay pattern in `src/components/organisms/CatalogFilterDrawer/CatalogFilterDrawer.tsx`.

Props:
```ts
{
  open: boolean
  onClose: () => void
  seller: SellerProps            // name, photo, handle — for the header
  seller_id: string
  context_id?: string            // product/order id -> deterministic room
  subject?: string | null        // product title, shown as "Re: …"
}
```

Structure:
- **Overlay:** `fixed inset-0 z-50` (above the header's `z-40`) with a dim + blur
  backdrop (`bg-black/40 backdrop-blur-sm`) that calls `onClose` on click.
- **Panel:** `absolute right-0 top-0 h-full w-full max-w-md bg-primary shadow-2xl flex
  flex-col`. Full-height (clears the header entirely). Full-screen on mobile,
  ~28rem docked right on `md+`. Slide-in via a `translate-x` transition
  (`translate-x-full` → `translate-x-0` when open).
- **Header (fixes missing identity):** a `border-b` row with
  - avatar — `seller.photo` (via `next/image`) or initials fallback,
  - `seller.name` + a muted "Verified supplier" line,
  - a small "Re: {subject}" context line when `subject` is set,
  - a "View supplier" `LocalizedClientLink` to `/sellers/{seller.handle}`,
  - a close (X) button (`CloseIcon`).
- **Body:** the existing `ChatBox`, filling remaining height (`flex-1 min-h-0`).
- **Behavior:** Esc key closes; `document.body` scroll locked while open (restore on
  close/unmount).

### Edits

- `src/components/organisms/Chat/Chat.tsx` — replace the `Modal` block with
  `<ChatDrawer open={modal} onClose={() => setModal(false)} seller={seller}
  seller_id={seller.id} context_id={product?.id || order_id}
  subject={subject || product?.title || null} />`. The button that toggles `modal`
  is unchanged. All four callers of `<Chat>` (product header, seller page hero,
  B2B purchase panel, order returns) inherit the drawer from this single change.
- `src/components/cells/ChatBox/ChatBox.tsx` — swap the fixed `h-[500px]` wrappers
  (loading, failed, and mounted states) for `h-full` so the pane fills the drawer body.
- `src/components/molecules/Modal/Modal.tsx` — untouched; other features keep using it.
- `MatrixChat.tsx` — untouched (already `h-full min-h-0 flex-col`; the drawer owns the
  seller header, so no in-pane header is added).

## Isolation / boundaries

- `ChatDrawer` = presentation shell (overlay, panel, seller header, open/close/scroll-lock).
  Depends on `ChatBox` + `SellerProps` + `LocalizedClientLink`/`CloseIcon`. Testable by
  toggling `open` and asserting panel visibility, header content, and close paths.
- `ChatBox` = data/orchestration (ensure room → render `MatrixChat`). Unchanged except
  height.
- `MatrixChat` = the message thread + composer. Unchanged.

## Verification (staging, logged-in customer)

1. Rename: PDP button reads "Add to cart"; clicking still adds to the cart (unchanged).
2. Drawer: PDP → "Write to seller" → panel slides in from the right, **full height,
   nothing clipped by the header**; seller avatar + name + "Verified supplier" + "Re:
   {product}" visible; messages + composer fill the height; sending a message works.
3. Close paths: backdrop click, Esc, and X all close it; page scroll is locked while open
   and restored after.
4. Second entry point (seller page hero "Write to seller") opens the same drawer.
5. Console clean; no regression to the buy-now cart.

## Non-goals

Multi-item quote basket, changing the RFQ/quotation flow, mobile inbox redesign, and any
change to the `/user/messages` two-pane inbox (which keeps its own layout).
