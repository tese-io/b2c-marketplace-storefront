'use client';

import { MatrixEvent, NotificationCountType, Room } from 'matrix-js-sdk';
import { useEffect, useState } from 'react';

import { MatrixChat } from '@/components/cells/MatrixChat/MatrixChat';
import { messagePreview } from '@/components/cells/MatrixChat/matrix-cards';
import {
  formatSmartTimestamp,
  initials
} from '@/components/cells/MatrixChat/matrix-utils';
import {
  useMatrix,
  useMatrixRooms
} from '@/components/providers/Matrix/MatrixProvider';
import { cn } from '@/lib/utils';

const lastMessageEvent = (room: Room): MatrixEvent | null => {
  const events = room.getLiveTimeline().getEvents();
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].getType() === 'm.room.message' && !events[i].isRedacted()) {
      return events[i];
    }
  }
  return null;
};

/**
 * Two-pane conversation inbox over the Matrix room list — a drop-in
 * replacement for the TalkJS <Inbox>.
 */
export function MatrixInbox({ className }: { className?: string }) {
  const { client, ready } = useMatrix();
  const rooms = useMatrixRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) {
      setSelectedRoomId(rooms[0].roomId);
    }
  }, [rooms, selectedRoomId]);

  if (!client || !ready) {
    return (
      <div
        className={cn('flex h-full items-center justify-center', className)}
        data-testid="user-messages-loading"
      >
        <p className="text-secondary text-md">Loading messages…</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div
        className={cn(
          'flex h-full flex-col items-center justify-center gap-2',
          className
        )}
      >
        <p className="text-secondary text-md">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full overflow-hidden rounded-sm border', className)}>
      <div className="w-64 shrink-0 overflow-y-auto border-r sm:w-72">
        {rooms.map(room => {
          const last = lastMessageEvent(room);
          const unread = room.getUnreadNotificationCount(
            NotificationCountType.Total
          );
          const selected = room.roomId === selectedRoomId;
          const own = last?.getSender() === client.getUserId();
          const preview = last
            ? `${own ? 'You: ' : ''}${messagePreview(last.getContent())}`
            : 'No messages yet';

          return (
            <button
              key={room.roomId}
              onClick={() => setSelectedRoomId(room.roomId)}
              className={cn(
                'flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-component-secondary',
                selected && 'bg-component-secondary'
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-component-secondary text-sm font-semibold">
                {initials(room.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex w-full items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-md truncate',
                      unread > 0 && 'font-semibold'
                    )}
                  >
                    {room.name}
                  </p>
                  {last && (
                    <p className="text-secondary shrink-0 text-sm">
                      {formatSmartTimestamp(last.getTs())}
                    </p>
                  )}
                </span>
                <span className="flex w-full items-center justify-between gap-2">
                  <p
                    className={cn(
                      'truncate text-sm',
                      unread > 0
                        ? 'text-primary font-medium'
                        : 'text-secondary'
                    )}
                  >
                    {preview}
                  </p>
                  {unread > 0 && (
                    <span className="bg-action text-action-on-primary flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs">
                      {unread}
                    </span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="min-w-0 flex-1 px-4">
        {selectedRoomId ? (
          <MatrixChat roomId={selectedRoomId} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-secondary text-md">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
