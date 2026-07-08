# Chat Drawer + Cart Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the mislabeled "Add to quote cart" button to "Add to cart", and replace the header-clipped centered chat Modal with a right-side chat drawer.

**Architecture:** Pure storefront (Next.js App Router) UI change. A new `ChatDrawer` client component is a thin full-height right-docked overlay (`z-50`, above the `z-40` sticky header) wrapping the existing `ChatBox` → `MatrixChat`. Per the 2026-07-06 thin-shell addendum, a concurrent inbox redesign already gave `MatrixChat` its own header (counterpart avatar + name + "Re: {product}") and an `onBack` close hook, so the drawer adds NO header of its own — it forwards `onClose` through `ChatBox` to `MatrixChat`'s `onBack`.

**Tech Stack:** Next.js 14 App Router, React client components, Tailwind (project design tokens), `matrix-js-sdk` (unchanged, inside `MatrixChat`).

## Global Constraints

- No new npm dependencies.
- The drawer overlay MUST be `z-50` (the sticky header is `z-40` in `src/components/organisms/Header/Header.tsx:36`; anything ≤ z-40 gets clipped).
- Do NOT modify `src/components/molecules/Modal/Modal.tsx` — other features still use it.
- Do NOT modify `MatrixChat.tsx`, `MatrixInbox.tsx`, `MessageCards.tsx`, `UserMessagesSection.tsx`, or the `/user/messages` page — these are being changed by a concurrent (owner-approved) inbox redesign. Keep every commit scoped to ONLY this task's files; never `git add -A` or sweep the redesign's uncommitted files into a commit.
- The redesigned `MatrixChat` signature is `{ roomId: string; className?: string; onBack?: () => void }`. Its header already shows the counterpart identity and a product subtitle; passing `onBack` renders an in-header back control.
- The repo has no React-component (RTL/jsdom) test harness — only pure-logic vitest `.test.ts`. Do NOT add an RTL harness. Verify UI in the browser with the Playwright MCP tools against the running staging stack. (In this session the controller performs browser verification; implementers do the edit + typecheck + scoped commit.)
- Staging test login (customer): `matrix-test@tese.io` / `secret123`. Storefront: `http://localhost:3000`. Product with a seller: `/pl/products/polypropylene-woven-bags` (seller: EuroMaterials Trading).
- Commit after each task.

---

### Task 1: Rename "Add to quote cart" → "Add to cart"  ✅ DONE (commit a2032d2)

**Files:**
- Modify: `src/components/organisms/B2BProductPurchasePanel/B2BProductPurchasePanel.tsx`

Changed the button label branch from `'Add to quote cart'` to `'Add to cart'`. No behavior change. Committed as `a2032d2`.

---

### Task 2: Thin chat drawer replaces the centered Modal

**Files:**
- Create: `src/components/organisms/Chat/ChatDrawer.tsx`
- Modify: `src/components/cells/ChatBox/ChatBox.tsx` (add `onClose`, forward as `onBack`; fill height)
- Modify: `src/components/organisms/Chat/Chat.tsx` (swap `Modal` → `ChatDrawer`)

**Interfaces:**
- Consumes: `ChatBox` from `@/components/cells/ChatBox/ChatBox` (props after this task: `{ seller_id: string; context_id?: string; subject?: string | null; onClose?: () => void }`). `MatrixChat` (unchanged file) prop `onBack?: () => void`.
- Produces: `ChatDrawer` — `export function ChatDrawer(props: { open: boolean; onClose: () => void; seller_id: string; context_id?: string; subject?: string | null }): JSX.Element | null`.

- [ ] **Step 1: Create `ChatDrawer.tsx`**

Create `src/components/organisms/Chat/ChatDrawer.tsx` with exactly:

```tsx
'use client';

import { useEffect } from 'react';

import { ChatBox } from '@/components/cells/ChatBox/ChatBox';

/**
 * Right-side "Write to seller" chat drawer. Overlays at z-50 (above the
 * sticky z-40 header, so nothing clips), full height, docked right. It is a
 * thin shell: the embedded MatrixChat already renders the seller header and
 * an in-header back control, so `onClose` is forwarded through ChatBox to
 * MatrixChat's `onBack` — no drawer-owned header.
 */
export function ChatDrawer({
  open,
  onClose,
  seller_id,
  context_id,
  subject,
}: {
  open: boolean;
  onClose: () => void;
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
        <ChatBox
          seller_id={seller_id}
          context_id={context_id}
          subject={subject}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `ChatBox` accepts `onClose`, forwards it, and fills height**

In `src/components/cells/ChatBox/ChatBox.tsx`:

Add `onClose` to the props type:

```tsx
type ChatBoxProps = {
  seller_id: string;
  /** Product or order id the chat is about (drives the deterministic room). */
  context_id?: string;
  subject?: string | null;
  /** Closes the surrounding drawer; wired to MatrixChat's in-header back. */
  onClose?: () => void;
};
```

Destructure it:

```tsx
export function ChatBox({ seller_id, context_id, subject, onClose }: ChatBoxProps) {
```

Replace every `h-[500px]` with `h-full` (the `failed` wrapper, the loading wrapper, and the mounted wrapper), and pass `onBack={onClose}` to `MatrixChat`. The final return becomes:

```tsx
  return (
    <div className="h-full w-full">
      <MatrixChat roomId={roomId} className="h-full" onBack={onClose} />
    </div>
  );
```

- [ ] **Step 3: Wire `ChatDrawer` into `Chat.tsx`**

In `src/components/organisms/Chat/Chat.tsx`:

Remove these two imports:

```tsx
import { ChatBox } from '@/components/cells/ChatBox/ChatBox';
import { Modal } from '@/components/molecules';
```

Add:

```tsx
import { ChatDrawer } from './ChatDrawer';
```

Replace the entire `{modal && ( <Modal …> … </Modal> )}` block with:

```tsx
      <ChatDrawer
        open={modal}
        onClose={() => setModal(false)}
        seller_id={seller.id}
        context_id={product?.id || order_id}
        subject={subject || product?.title || null}
      />
```

- [ ] **Step 4: Typecheck the changed files**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "Chat/ChatDrawer|Chat/Chat.tsx|ChatBox" | head
```
Expected: no output (pre-existing unrelated `@medusajs/types` errors elsewhere don't match these paths).

- [ ] **Step 5: Commit (scoped)**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/organisms/Chat/ChatDrawer.tsx \
        src/components/organisms/Chat/Chat.tsx \
        src/components/cells/ChatBox/ChatBox.tsx
git commit -m "Replace header-clipped chat Modal with a right-side ChatDrawer

The 'Write to seller' chat used the generic Modal (z-30), which the sticky
z-40 header rendered over, clipping its title bar. New ChatDrawer is a
full-height right-docked overlay at z-50; it wraps the (self-headered)
MatrixChat and forwards close to its in-header back control. Closes via
backdrop / Esc, with background scroll locked. All four Chat entry points
inherit it."
```

Do NOT stage any other file (a concurrent inbox redesign has unrelated files modified in the working tree).

**Controller browser verification (not the implementer):**
1. Log in as `matrix-test@tese.io` / `secret123`; navigate `/pl/products/polypropylene-woven-bags`.
2. Click "Write to seller". Assert `[data-testid="chat-drawer"]` exists; panel `getBoundingClientRect().top === 0` (full height, not clipped); `document.body.style.overflow === 'hidden'`.
3. Assert the MatrixChat header inside shows the counterpart name (no duplicate/second header).
4. Send a message; confirm it appears.
5. Close via the in-header back control, via backdrop click, and via Esc; each closes and restores `body.overflow`.
6. Screenshot for visual confirmation. Spot-check a second entry point (seller page "Write to seller").

---

## Self-Review

**Spec coverage (incl. thin-shell addendum):**
- Cart rename → Task 1 (done, a2032d2). ✓
- Drawer overlay z-50 above header, full-height right panel → Task 2 Step 1. ✓
- Thin shell, no drawer-owned header; identity comes from MatrixChat → Task 2 Step 1 (wraps ChatBox only). ✓
- `onClose` forwarded to MatrixChat `onBack` via ChatBox → Task 2 Steps 1-2. ✓
- ChatBox fills height → Task 2 Step 2. ✓
- Chat.tsx swaps Modal → Task 2 Step 3. ✓
- Modal / MatrixChat / inbox files untouched; commits scoped → Global Constraints + Step 5. ✓
- Esc + backdrop + scroll-lock → Task 2 Step 1. ✓

**Placeholder scan:** none — full code and exact commands.

**Type consistency:** `ChatDrawer` props (`open`, `onClose`, `seller_id`, `context_id`, `subject`) match its invocation in Step 3. `ChatBox` gains `onClose?: () => void`, forwarded as `MatrixChat`'s `onBack?: () => void` (matches the redesigned signature). No `seller`/`Avatar`/`CloseIcon` deps remain.
