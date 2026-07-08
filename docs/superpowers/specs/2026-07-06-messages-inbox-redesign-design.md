# Messages inbox redesign — design

## Context

The `/user/messages` page (`b2c-marketplace-storefront`) uses `MatrixInbox` +
`MatrixChat` over the Matrix SDK. The current UI has weak hierarchy, no search,
no mobile drawer pattern, emoji attachment icon, and commerce cards that clash
with the tese sourcing workspace aesthetic.

**Scope:** Option C — full messaging experience. **Constraint:** zero functional
regressions (Matrix send/receive, attachments, read receipts, typing, product
cards, quotations, quote accept/decline).

## Approach

Component refactor + CSS tokens (Approach B). Presentation-only changes; all
Matrix SDK calls and event handlers preserved.

## Changes

### Page shell
- Remove duplicate page title from `WorkspaceAccountPage`.
- Full-height inbox card with cart-style gradient mesh on `--tese-surface`.

### Thread list
- Header: "Messages" + total unread badge.
- Client-side search (room name + preview).
- Tabs: All | Unread.
- Selected row: white bg + `--tese-lime` left accent.
- Sort by last message timestamp.

### Chat header
- Counterpart name + avatar (existing `counterpart` logic).
- Subtitle from latest product card in timeline (read-only scan).
- Mobile back button → list pane (UI state only).

### Composer
- SourcingInput-inspired pill container.
- SVG attach icon (not emoji).
- Lime send button; Enter/Shift+Enter behavior unchanged.

### Commerce cards
- White card shell, lime primary CTA, outline secondary.
- Quotation accept/decline logic unchanged.

### Responsive
- `<768px`: list OR chat; back toggles panes.
- `≥768px`: side-by-side split.

### Empty / loading
- Shimmer skeleton while Matrix initializes.
- Empty state with "Browse catalogue" → `/categories`.

## Files

| File | Change |
|------|--------|
| `globals.css` | `.tese-messages-*` tokens |
| `MatrixInbox.tsx` | Search, tabs, mobile layout, styling |
| `MatrixChat.tsx` | Header, composer, bubble classes |
| `MessageCards.tsx` | Card visual refresh |
| `UserMessagesSection.tsx` | Shell height |
| `user/messages/page.tsx` | Remove page title |

## Not changed

`matrix-cards.ts`, `matrix-utils.ts`, `MatrixProvider`, all send/read/typing/quote
handlers.

## Verification

1. Messages load; first room auto-selected on desktop.
2. Search and Unread tab filter correctly.
3. Send text, attach file, product cards, quotations, accept/decline work.
4. Read receipts and typing indicators work.
5. Mobile: list → select → chat → back → list.
6. Empty state links to catalogue.
7. Sidebar unread badge unchanged.
