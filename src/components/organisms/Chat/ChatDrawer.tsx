'use client';

import { useEffect } from 'react';

import { ChatBox } from '@/components/cells/ChatBox/ChatBox';
import { CloseIcon } from '@/icons';

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
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          data-testid="chat-drawer-close"
          className="absolute right-3 top-3 z-10 hidden h-8 w-8 items-center justify-center rounded-full text-secondary hover:bg-black/5 hover:text-primary md:inline-flex"
        >
          <CloseIcon size={18} />
        </button>
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
