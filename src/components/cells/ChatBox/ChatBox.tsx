'use client';

import { useEffect, useState } from 'react';

import { MatrixChat } from '@/components/cells/MatrixChat/MatrixChat';
import { ensureSellerChatRoom } from '@/lib/data/matrix';

type ChatBoxProps = {
  seller_id: string;
  /** Product or order id the chat is about (drives the deterministic room). */
  context_id?: string;
  subject?: string | null;
  /** Closes the surrounding drawer; wired to MatrixChat's in-header back. */
  onClose?: () => void;
};

/**
 * Get-or-create the customer<->seller Matrix room for this context, then
 * render the chat pane (replaces the mounted TalkJS chatbox).
 */
export function ChatBox({ seller_id, context_id, subject, onClose }: ChatBoxProps) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;

    ensureSellerChatRoom({
      seller_id,
      context_id,
      subject: subject || undefined
    }).then(room => {
      if (disposed) return;
      if (room?.room_id) {
        setRoomId(room.room_id);
      } else {
        setFailed(true);
      }
    });

    return () => {
      disposed = true;
    };
  }, [seller_id, context_id, subject]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-secondary text-md">
          The chat is unavailable right now — please try again later.
        </p>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-secondary text-md">Opening chat…</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MatrixChat roomId={roomId} className="h-full" onBack={onClose} />
    </div>
  );
}
