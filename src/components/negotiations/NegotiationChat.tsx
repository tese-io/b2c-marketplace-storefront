'use client'

import { useState, useRef, useEffect } from 'react'
import { NegotiationThread, NegotiationMessage, NegotiationThreadStatus } from '@/types/rfq'
import { sendNegotiationMessage } from '@/lib/data/rfq'

interface NegotiationChatProps {
  negotiation: NegotiationThread
  initialMessages: NegotiationMessage[]
}

const STATUS_CONFIG: Record<NegotiationThreadStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-positive' },
  awaiting_buyer: { label: 'Your Turn to Respond', color: 'bg-action' },
  awaiting_seller: { label: 'Awaiting Vendor Response', color: 'bg-tese-ice' },
  on_hold: { label: 'On Hold', color: 'bg-warning' },
  closed_accepted: { label: 'Deal Accepted', color: 'bg-positive' },
  closed_rejected: { label: 'Closed - Rejected', color: 'bg-negative' },
  closed_expired: { label: 'Closed - Expired', color: 'bg-disabled' },
}

export function NegotiationChat({ negotiation, initialMessages }: NegotiationChatProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const statusCfg = STATUS_CONFIG[negotiation.status] || STATUS_CONFIG.active
  const isClosed = negotiation.status.startsWith('closed_')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const message = await sendNegotiationMessage(negotiation.id, {
        content: newMessage.trim(),
        message_type: 'text',
      })
      setMessages((prev) => [...prev, message])
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 bg-card border border-primary rounded-t-sm">
        <div className="flex items-center gap-4">
          <a href="/negotiations" className="text-secondary hover:text-action transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h2 className="heading-sm text-primary">
              Negotiation #{negotiation.id.slice(-6)}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${statusCfg.color}`} />
              <span className="text-[12px] text-secondary">{statusCfg.label}</span>
              <span className="text-[12px] text-secondary">
                — {negotiation.proposal_count}/{negotiation.max_proposals} proposals
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-secondary border-x border-primary">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-secondary">No messages yet. Start the conversation.</p>
          </div>
        )}

        {messages.map((msg) => {
          const isBuyer = msg.sender_type === 'buyer'
          const isSystem = msg.sender_type === 'system'

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="inline-flex px-4 py-1.5 bg-component-secondary rounded-full text-[12px] text-secondary">
                  {msg.content}
                </span>
              </div>
            )
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-sm p-4 ${
                  isBuyer
                    ? 'bg-action text-action-on-primary'
                    : 'bg-card border border-primary text-primary'
                }`}
              >
                {msg.message_type === 'proposal' || msg.message_type === 'counter_proposal' ? (
                  <div>
                    <span className={`text-[11px] font-medium uppercase tracking-wider ${
                      isBuyer ? 'text-action-on-primary opacity-70' : 'text-action'
                    }`}>
                      {msg.message_type === 'proposal' ? 'New Proposal' : 'Counter-Proposal'}
                    </span>
                    <p className="mt-1 text-sm">{msg.content}</p>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                <p className={`text-[10px] mt-2 ${
                  isBuyer ? 'text-action-on-primary opacity-60' : 'text-secondary'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isClosed ? (
        <form onSubmit={handleSend} className="p-4 bg-card border border-primary rounded-b-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="flex-1 px-4 py-3 border border-primary rounded-xs bg-card text-primary text-sm placeholder:text-disabled focus:outline-none focus:border-action transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="px-5 py-3 bg-action hover:bg-action-hover disabled:bg-disabled text-action-on-primary font-medium rounded-xs transition-colors"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-component-secondary border border-primary rounded-b-sm text-center">
          <p className="text-sm text-secondary">This negotiation has been closed.</p>
        </div>
      )}
    </div>
  )
}
