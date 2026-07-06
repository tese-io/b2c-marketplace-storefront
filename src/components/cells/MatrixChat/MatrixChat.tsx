'use client';

import {
  MatrixClient,
  MatrixEvent,
  MsgType,
  Room,
  RoomEvent,
  RoomMember,
  RoomMemberEvent
} from 'matrix-js-sdk';
import type { RoomMessageEventContent } from 'matrix-js-sdk/lib/@types/events';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMatrix } from '@/components/providers/Matrix/MatrixProvider';
import { cn } from '@/lib/utils';

import {
  buildQuoteResponseContent,
  getProductCard,
  getQuotation,
  getQuoteResponse,
  isCardContent
} from './matrix-cards';
import {
  buildTimeline,
  formatDateSeparator,
  formatTimeOfDay,
  initials
} from './matrix-utils';
import {
  ProductCardMessage,
  QuotationCardMessage,
  QuoteStatus
} from './MessageCards';

const isDisplayableMessage = (event: MatrixEvent) =>
  event.getType() === 'm.room.message' && !event.isRedacted();

const timelineMessages = (room: Room) =>
  room.getLiveTimeline().getEvents().filter(isDisplayableMessage);

/**
 * Renders mxc:// media through the authenticated media endpoint (plain
 * <img src> can't send the Authorization header Synapse requires).
 */
const useMxcObjectUrl = (client: MatrixClient | null, mxcUrl?: string) => {
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    if (!client || !mxcUrl) return;

    const httpUrl = client.mxcUrlToHttp(
      mxcUrl,
      undefined,
      undefined,
      undefined,
      false,
      true,
      true
    );
    if (!httpUrl) return;

    let objectUrl: string | undefined;
    let disposed = false;

    fetch(httpUrl, {
      headers: { Authorization: `Bearer ${client.getAccessToken()}` }
    })
      .then(response => (response.ok ? response.blob() : null))
      .then(blob => {
        if (blob && !disposed) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      })
      .catch(() => {});

    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [client, mxcUrl]);

  return url;
};

function MessageContent({
  client,
  event,
  quoteStatuses,
  onRespondToQuote
}: {
  client: MatrixClient;
  event: MatrixEvent;
  quoteStatuses: Record<string, QuoteStatus>;
  onRespondToQuote: (
    event: MatrixEvent,
    status: 'accepted' | 'declined'
  ) => Promise<void>;
}) {
  const content = event.getContent();
  const mediaUrl = useMxcObjectUrl(
    client,
    content.msgtype === MsgType.Image || content.msgtype === MsgType.File
      ? content.url
      : undefined
  );

  const productCard = getProductCard(content);
  if (productCard) {
    return <ProductCardMessage card={productCard} />;
  }

  const quotation = getQuotation(content);
  if (quotation) {
    const own = event.getSender() === client.getUserId();
    return (
      <QuotationCardMessage
        quotation={quotation}
        status={quoteStatuses[quotation.quote_id] || 'pending'}
        canRespond={!own}
        onRespond={status => onRespondToQuote(event, status)}
      />
    );
  }

  if (content.msgtype === MsgType.Image) {
    return mediaUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mediaUrl}
        alt={content.body}
        className="max-h-64 max-w-full rounded-sm"
      />
    ) : (
      <p className="text-md italic">{content.body}</p>
    );
  }

  if (content.msgtype === MsgType.File) {
    return (
      <a href={mediaUrl} download={content.body} className="underline break-all">
        📎 {content.body}
      </a>
    );
  }

  return (
    <p className="text-md whitespace-pre-wrap break-words">{content.body}</p>
  );
}

const DateSeparator = ({ ts }: { ts: number }) => (
  <div className="flex items-center gap-3 py-1">
    <hr className="flex-1" />
    <p className="text-secondary text-sm">{formatDateSeparator(ts)}</p>
    <hr className="flex-1" />
  </div>
);

/**
 * Single-room chat pane: timeline with commerce cards + composer.
 */
export function MatrixChat({
  roomId,
  className
}: {
  roomId: string;
  className?: string;
}) {
  const { client, ready } = useMatrix();
  const [events, setEvents] = useState<MatrixEvent[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingSentRef = useRef(0);
  const lastReadSentRef = useRef<string | null>(null);

  // The room can lag one sync behind its creation via the backend API.
  useEffect(() => {
    if (!client || !ready) return;

    const resolve = () => {
      const found = client.getRoom(roomId);
      if (found) setRoom(found);
      return !!found;
    };

    if (resolve()) return;

    const interval = setInterval(() => {
      if (resolve()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [client, ready, roomId]);

  useEffect(() => {
    if (!client || !room) return;

    const refresh = () => setEvents(timelineMessages(room));

    refresh();

    if (timelineMessages(room).length < 20) {
      client.scrollback(room, 30).then(refresh).catch(() => {});
    }

    const onTimeline = (_event: MatrixEvent, eventRoom?: Room) => {
      if (!eventRoom || eventRoom.roomId === room.roomId) refresh();
    };

    const onTyping = (_event: unknown, member: RoomMember) => {
      if (member.roomId !== room.roomId) return;
      if (member.userId === client.getUserId()) return;
      setTypingNames(
        room
          .getMembers()
          .filter(m => m.typing && m.userId !== client.getUserId())
          .map(m => m.name)
      );
    };

    client.on(RoomEvent.Timeline, onTimeline);
    client.on(RoomEvent.LocalEchoUpdated, refresh);
    client.on(RoomEvent.Receipt, refresh);
    client.on(RoomMemberEvent.Typing, onTyping);

    return () => {
      client.removeListener(RoomEvent.Timeline, onTimeline);
      client.removeListener(RoomEvent.LocalEchoUpdated, refresh);
      client.removeListener(RoomEvent.Receipt, refresh);
      client.removeListener(RoomMemberEvent.Typing, onTyping);
    };
  }, [client, room]);

  // Mark the latest event as read while the chat is on screen. Guarded per
  // event id — the Receipt listener refreshes `events`, and re-sending here
  // on every refresh would loop receipt -> refresh -> receipt forever.
  useEffect(() => {
    const last = events[events.length - 1];
    if (
      client &&
      last &&
      last.getSender() !== client.getUserId() &&
      last.getId() !== lastReadSentRef.current
    ) {
      lastReadSentRef.current = last.getId() || null;
      client.sendReadReceipt(last).catch(() => {});
    }
    // Scroll only the message list, not the whole page.
    const list = bottomRef.current?.parentElement;
    if (list) list.scrollTop = list.scrollHeight;
  }, [client, events]);

  /** quote_id -> latest accept/decline response found in the timeline. */
  const quoteStatuses = useMemo(() => {
    const map: Record<string, QuoteStatus> = {};
    for (const event of events) {
      const response = getQuoteResponse(event.getContent());
      if (response) map[response.quote_id] = response.status;
    }
    return map;
  }, [events]);

  const counterpart = useMemo(() => {
    if (!client || !room) return null;
    return (
      room
        .getMembers()
        .find(
          member =>
            member.userId !== client.getUserId() &&
            ['join', 'invite'].includes(member.membership || '')
        ) || null
    );
  }, [client, room]);

  /** Index of the last event the counterpart has read (-1 if none). */
  const counterpartReadIndex = useMemo(() => {
    if (!room || !counterpart) return -1;
    const readEventId = room.getEventReadUpTo(counterpart.userId);
    if (!readEventId) return -1;
    return events.findIndex(event => event.getId() === readEventId);
  }, [room, counterpart, events]);

  const timeline = useMemo(
    () =>
      buildTimeline(
        events,
        event => event.getSender() || undefined,
        event => event.getTs()
      ),
    [events]
  );

  const lastOwnEventIndex = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].getSender() === client?.getUserId()) return i;
    }
    return -1;
  }, [events, client]);

  /**
   * Buyer accepts/declines a quotation: best-effort RFQ accept when the
   * quote is linked to an enquiry, then the chat response event.
   */
  const respondToQuote = useCallback(
    async (quotationEvent: MatrixEvent, status: 'accepted' | 'declined') => {
      if (!client) return;
      const quotation = getQuotation(quotationEvent.getContent());
      if (!quotation) return;

      if (status === 'accepted' && quotation.enquiry_id) {
        try {
          await fetch(
            `/api/storefront/enquiries/${encodeURIComponent(quotation.enquiry_id)}/accept`,
            { method: 'POST' }
          );
        } catch (error) {
          console.error('Could not accept the linked enquiry', error);
        }
      }

      await client.sendMessage(
        roomId,
        buildQuoteResponseContent(
          quotation.quote_id,
          status,
          quotationEvent.getId() || undefined
        ) as unknown as RoomMessageEventContent
      );
    },
    [client, roomId]
  );

  const notifyTyping = useCallback(() => {
    if (!client) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current > 3000) {
      lastTypingSentRef.current = now;
      client.sendTyping(roomId, true, 4000).catch(() => {});
    }
  }, [client, roomId]);

  const sendText = useCallback(async () => {
    const body = text.trim();
    if (!client || !body || sending) return;
    setSending(true);
    try {
      client.sendTyping(roomId, false, 0).catch(() => {});
      await client.sendMessage(roomId, { msgtype: MsgType.Text, body });
      setText('');
    } catch (error) {
      console.error('Could not send message', error);
    } finally {
      setSending(false);
    }
  }, [client, roomId, text, sending]);

  const sendFile = useCallback(
    async (file: File) => {
      if (!client) return;
      setSending(true);
      try {
        const upload = await client.uploadContent(file, {
          name: file.name,
          type: file.type
        });
        const content = {
          msgtype: file.type.startsWith('image/')
            ? MsgType.Image
            : MsgType.File,
          body: file.name,
          url: upload.content_uri,
          info: { mimetype: file.type, size: file.size }
        };
        await client.sendMessage(roomId, content as RoomMessageEventContent);
      } catch (error) {
        console.error('Could not send attachment', error);
      } finally {
        setSending(false);
      }
    },
    [client, roomId]
  );

  if (!client || !ready || !room) {
    return (
      <div className={cn('flex h-full items-center justify-center', className)}>
        <p className="text-secondary text-md">Loading chat…</p>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full min-h-0 flex-col', className)}>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-1 py-3">
        {events.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-secondary text-md">
              No messages yet — say hello!
            </p>
          </div>
        )}
        {timeline.map(({ event, groupStart, groupEnd, newDay }, index) => {
          const content = event.getContent();
          const own = event.getSender() === client.getUserId();

          const quoteResponse = getQuoteResponse(content);
          if (quoteResponse) {
            return (
              <div key={event.getId()}>
                {newDay && <DateSeparator ts={event.getTs()} />}
                <div className="flex justify-center py-1">
                  <p className="text-secondary rounded-full bg-component-secondary px-3 py-0.5 text-sm">
                    {content.body}
                  </p>
                </div>
              </div>
            );
          }

          const card = isCardContent(content);
          const seen =
            own && index === lastOwnEventIndex && counterpartReadIndex >= index;

          return (
            <div key={event.getId()}>
              {newDay && <DateSeparator ts={event.getTs()} />}
              <div
                className={cn(
                  'flex gap-2',
                  own ? 'justify-end' : 'justify-start',
                  groupStart && 'mt-2'
                )}
              >
                {!own && (
                  <div className="w-6 shrink-0 self-end">
                    {groupEnd && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-component-secondary text-xs">
                        {initials(event.sender?.name)}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    'flex max-w-[72%] flex-col',
                    own ? 'items-end' : 'items-start'
                  )}
                >
                  {!own && groupStart && (
                    <p className="text-secondary mb-0.5 px-1 text-sm">
                      {event.sender?.name || event.getSender()}
                    </p>
                  )}
                  {card ? (
                    <MessageContent
                      client={client}
                      event={event}
                      quoteStatuses={quoteStatuses}
                      onRespondToQuote={respondToQuote}
                    />
                  ) : (
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2',
                        own
                          ? 'bg-action text-action-on-primary rounded-br-sm'
                          : 'rounded-tl-sm bg-component-secondary'
                      )}
                    >
                      <MessageContent
                        client={client}
                        event={event}
                        quoteStatuses={quoteStatuses}
                        onRespondToQuote={respondToQuote}
                      />
                    </div>
                  )}
                  {(groupEnd || seen) && (
                    <p className="text-secondary mt-0.5 px-1 text-sm">
                      {formatTimeOfDay(event.getTs())}
                      {seen && ' · Seen'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {typingNames.length > 0 && (
          <p className="text-secondary pt-1 text-sm italic">
            {typingNames.join(', ')} is typing…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 border-t pt-3">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) sendFile(file);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          aria-label="Attach a file"
          disabled={sending}
          onClick={() => fileInputRef.current?.click()}
          className="text-secondary hover:text-primary px-2 py-2"
        >
          📎
        </button>
        <textarea
          value={text}
          onChange={e => {
            setText(e.target.value);
            notifyTyping();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendText();
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="text-md focus:border-primary max-h-32 flex-1 resize-none rounded-xl border px-4 py-2 outline-none"
        />
        <button
          type="button"
          disabled={sending || !text.trim()}
          onClick={sendText}
          className="bg-action text-action-on-primary rounded-sm px-4 py-2 text-md disabled:opacity-40"
        >
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
