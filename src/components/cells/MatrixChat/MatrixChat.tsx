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
import { ArrowLeftIcon } from '@/icons';
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
  <div className="tese-messages-date-separator">
    <span>{formatDateSeparator(ts)}</span>
  </div>
);

function AttachIcon ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.5 6.5V15.25a4.25 4.25 0 1 1-8.5 0V5.75a2.75 2.75 0 1 1 5.5 0v9.5a1.25 1.25 0 1 1-2.5 0V6.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon () {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h12M13 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Single-room chat pane: timeline with commerce cards + composer.
 */
export function MatrixChat({
  roomId,
  className,
  onBack
}: {
  roomId: string;
  className?: string;
  onBack?: () => void;
}) {
  const { client, ready } = useMatrix();
  const [events, setEvents] = useState<MatrixEvent[]>([]);
  const [room, setRoom] = useState<Room | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const latestProductTitle = useMemo(() => {
    for (let i = events.length - 1; i >= 0; i--) {
      const card = getProductCard(events[i].getContent());
      if (card?.product?.title) return card.product.title;
    }
    return null;
  }, [events]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

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
      <div className={cn('tese-messages-chat-loading', className)}>
        <p>Loading chat…</p>
      </div>
    );
  }

  const headerName = counterpart?.name || room.name || 'Conversation';
  const headerInitials = initials(headerName);

  return (
    <div className={cn('tese-messages-chat-pane', className)}>
      <header className="tese-messages-chat-head">
        {onBack ? (
          <button
            type="button"
            className="tese-messages-back"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <ArrowLeftIcon size={18} />
          </button>
        ) : null}
        <span className="tese-messages-chat-head-avatar">{headerInitials}</span>
        <div className="tese-messages-chat-head-text">
          <p className="tese-messages-chat-head-name">{headerName}</p>
          {latestProductTitle ? (
            <p className="tese-messages-chat-head-context">
              Re: {latestProductTitle}
            </p>
          ) : null}
        </div>
      </header>

      <div className="tese-messages-timeline">
        {events.length === 0 && (
          <div className="tese-messages-timeline-empty">
            <p>No messages yet — say hello!</p>
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
                <div className="tese-messages-system-note">
                  <p>{content.body}</p>
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
                  'tese-messages-row',
                  own ? 'is-own' : 'is-incoming',
                  groupStart && 'is-group-start'
                )}
              >
                {!own && (
                  <div className="tese-messages-row-avatar-slot">
                    {groupEnd && (
                      <span className="tese-messages-row-avatar">
                        {initials(event.sender?.name)}
                      </span>
                    )}
                  </div>
                )}
                <div className="tese-messages-row-content">
                  {!own && groupStart && (
                    <p className="tese-messages-sender-name">
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
                        'tese-messages-bubble',
                        own ? 'is-own' : 'is-incoming'
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
                    <p className="tese-messages-meta">
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
          <div className="tese-messages-typing" aria-live="polite">
            <span className="tese-messages-typing-dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            {typingNames.join(', ')} is typing…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="tese-messages-composer">
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
        <div className="tese-messages-composer-inner">
          <button
            type="button"
            aria-label="Attach a file"
            disabled={sending}
            onClick={() => fileInputRef.current?.click()}
            className="tese-messages-attach"
          >
            <AttachIcon />
          </button>
          <textarea
            ref={textareaRef}
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
            className="tese-messages-input"
          />
          <button
            type="button"
            disabled={sending || !text.trim()}
            onClick={sendText}
            className="tese-messages-send"
            aria-label={sending ? 'Sending message' : 'Send message'}
          >
            {sending ? (
              <span className="tese-messages-send-label">…</span>
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
