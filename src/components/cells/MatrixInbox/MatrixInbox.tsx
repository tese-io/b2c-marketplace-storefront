'use client';

import { MatrixEvent, NotificationCountType, Room } from 'matrix-js-sdk';
import { useEffect, useMemo, useState } from 'react';

import { MatrixChat } from '@/components/cells/MatrixChat/MatrixChat';
import { messagePreview } from '@/components/cells/MatrixChat/matrix-cards';
import {
  formatSmartTimestamp,
  initials
} from '@/components/cells/MatrixChat/matrix-utils';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import {
  useMatrix,
  useMatrixRooms
} from '@/components/providers/Matrix/MatrixProvider';
import { cn } from '@/lib/utils';

type FilterTab = 'all' | 'unread';

const lastMessageEvent = (room: Room): MatrixEvent | null => {
  const events = room.getLiveTimeline().getEvents();
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].getType() === 'm.room.message' && !events[i].isRedacted()) {
      return events[i];
    }
  }
  return null;
};

function SearchIcon () {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function MessagesLoadingSkeleton () {
  return (
    <div className="tese-messages-skeleton" data-testid="user-messages-loading">
      <div className="tese-messages-skeleton-list">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="tese-messages-skeleton-row">
            <div className="tese-messages-skeleton-avatar" />
            <div className="tese-messages-skeleton-lines">
              <div className="tese-messages-skeleton-line tese-messages-skeleton-line--short" />
              <div className="tese-messages-skeleton-line" />
            </div>
          </div>
        ))}
      </div>
      <div className="tese-messages-skeleton-chat" />
    </div>
  );
}

function MessagesEmptyState () {
  return (
    <div className="tese-messages-empty">
      <div className="tese-messages-empty-icon" aria-hidden>
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
          <path
            d="M21 12a8.5 8.5 0 0 1-1.2 4.3L21 21l-4.7-1.2A8.5 8.5 0 1 1 21 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="tese-messages-empty-title">No conversations yet</p>
      <p className="tese-messages-empty-desc">
        Start a conversation with a supplier from a product page or inquiry.
      </p>
      <LocalizedClientLink href="/categories" className="tese-messages-empty-cta">
        Browse catalogue
      </LocalizedClientLink>
    </div>
  );
}

/**
 * Two-pane conversation inbox over the Matrix room list — a drop-in
 * replacement for the TalkJS <Inbox>.
 */
export function MatrixInbox ({ className }: { className?: string }) {
  const { client, ready } = useMatrix();
  const rooms = useMatrixRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    if (!selectedRoomId && rooms.length > 0) {
      setSelectedRoomId(rooms[0].roomId);
    }
  }, [rooms, selectedRoomId]);

  const totalUnread = useMemo(
    () =>
      rooms.reduce(
        (sum, room) =>
          sum + room.getUnreadNotificationCount(NotificationCountType.Total),
        0
      ),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = [...rooms];

    if (filterTab === 'unread') {
      list = list.filter(
        room =>
          room.getUnreadNotificationCount(NotificationCountType.Total) > 0
      );
    }

    if (query) {
      list = list.filter(room => {
        const last = lastMessageEvent(room);
        const own = last?.getSender() === client?.getUserId();
        const preview = last
          ? `${own ? 'you: ' : ''}${messagePreview(last.getContent())}`
          : '';
        return (
          room.name?.toLowerCase().includes(query) ||
          preview.toLowerCase().includes(query)
        );
      });
    }

    return list.sort((a, b) => {
      const aTs = lastMessageEvent(a)?.getTs() ?? 0;
      const bTs = lastMessageEvent(b)?.getTs() ?? 0;
      return bTs - aTs;
    });
  }, [rooms, searchQuery, filterTab, client]);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setMobileShowChat(true);
  };

  if (!client || !ready) {
    return (
      <div className={cn('tese-messages', className)}>
        <MessagesLoadingSkeleton />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className={cn('tese-messages', className)}>
        <MessagesEmptyState />
      </div>
    );
  }

  return (
    <div className={cn('tese-messages', className)}>
      <div className="tese-messages-shell">
        <aside
          className={cn(
            'tese-messages-list',
            mobileShowChat && 'tese-messages-list--hidden-mobile'
          )}
        >
          <header className="tese-messages-list-head">
            <div className="tese-messages-list-head-top">
              <h1 className="tese-messages-title">Messages</h1>
              {totalUnread > 0 ? (
                <span className="tese-messages-total-badge">{totalUnread}</span>
              ) : null}
            </div>
            <label className="tese-messages-search">
              <SearchIcon />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations…"
                className="tese-messages-search-input"
                aria-label="Search conversations"
              />
            </label>
            <div className="tese-messages-tabs" role="tablist" aria-label="Filter conversations">
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === 'all'}
                className={cn(
                  'tese-messages-tab',
                  filterTab === 'all' && 'is-active'
                )}
                onClick={() => setFilterTab('all')}
              >
                All
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={filterTab === 'unread'}
                className={cn(
                  'tese-messages-tab',
                  filterTab === 'unread' && 'is-active'
                )}
                onClick={() => setFilterTab('unread')}
              >
                Unread
                {totalUnread > 0 ? (
                  <span className="tese-messages-tab-badge">{totalUnread}</span>
                ) : null}
              </button>
            </div>
          </header>

          <ul className="tese-messages-threads">
            {filteredRooms.length === 0 ? (
              <li className="tese-messages-threads-empty">
                No conversations match your search.
              </li>
            ) : (
              filteredRooms.map(room => {
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
                  <li key={room.roomId}>
                    <button
                      type="button"
                      onClick={() => handleSelectRoom(room.roomId)}
                      className={cn(
                        'tese-messages-thread',
                        selected && 'is-selected'
                      )}
                    >
                      <span className="tese-messages-thread-avatar">
                        {initials(room.name)}
                      </span>
                      <span className="tese-messages-thread-body">
                        <span className="tese-messages-thread-top">
                          <span
                            className={cn(
                              'tese-messages-thread-name',
                              unread > 0 && 'is-unread'
                            )}
                          >
                            {room.name}
                          </span>
                          {last ? (
                            <span className="tese-messages-thread-time">
                              {formatSmartTimestamp(last.getTs())}
                            </span>
                          ) : null}
                        </span>
                        <span className="tese-messages-thread-bottom">
                          <span
                            className={cn(
                              'tese-messages-thread-preview',
                              unread > 0 && 'is-unread'
                            )}
                          >
                            {preview}
                          </span>
                          {unread > 0 ? (
                            <span className="tese-messages-thread-unread">
                              {unread}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        <main
          className={cn(
            'tese-messages-chat',
            !mobileShowChat && 'tese-messages-chat--hidden-mobile'
          )}
        >
          {selectedRoomId ? (
            <MatrixChat
              roomId={selectedRoomId}
              onBack={() => setMobileShowChat(false)}
              className="h-full"
            />
          ) : (
            <div className="tese-messages-chat-placeholder">
              <div className="tese-messages-chat-placeholder-icon" aria-hidden>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12a8.5 8.5 0 0 1-1.2 4.3L21 21l-4.7-1.2A8.5 8.5 0 1 1 21 12Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="tese-messages-chat-placeholder-title">
                Select a conversation
              </p>
              <p className="tese-messages-chat-placeholder-desc">
                Choose a thread from the list to view messages.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
