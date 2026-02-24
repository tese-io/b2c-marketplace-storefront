'use client'

import { Inbox } from '@talkjs/react'
import Talk from 'talkjs'
import { useCallback, useEffect, useState } from 'react'
import { getChatRooms, getMatrixToken } from '@/lib/data/chat'
import { MatrixChatBox } from '@/components/cells/MatrixChatBox/MatrixChatBox'

const MATRIX_CHAT_ENABLED = process.env.NEXT_PUBLIC_MATRIX_CHAT_ENABLED === 'true'
const TALKJS_APP_ID = process.env.NEXT_PUBLIC_TALKJS_APP_ID || ''

export function UserMessagesSection () {
  const syncConversation = useCallback((session: Talk.Session) => {
    const conversation = session.getOrCreateConversation(
      'my_conversations' + session.me.id
    )
    conversation.setParticipant(session.me)
    return conversation
  }, [])

  const [rooms, setRooms] = useState<Array<{ room_id: string, name: string, seller_id: string }>>([])
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [session, setSession] = useState<{ access_token: string, user_id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!MATRIX_CHAT_ENABLED) return
    getChatRooms().then(setRooms).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!MATRIX_CHAT_ENABLED || !selectedRoomId) return
    getMatrixToken().then((t) => {
      if (t) setSession({ access_token: t.access_token, user_id: t.user_id })
    })
  }, [selectedRoomId])

  if (MATRIX_CHAT_ENABLED) {
    return (
      <div className="flex max-h-[655px] w-full max-w-[760px] flex-col gap-4">
        {loading
          ? (
              <div className="flex h-96 w-full items-center justify-center" data-testid="user-messages-loading">
                Loading…
              </div>
            )
          : rooms.length === 0
            ? (
                <div className="rounded border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                  No conversations yet. Start a chat from a product or seller page.
                </div>
              )
            : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {rooms.map((r) => (
                      <button
                        key={r.room_id}
                        type="button"
                        onClick={() => setSelectedRoomId(r.room_id)}
                        className={`rounded border px-3 py-2 text-sm ${selectedRoomId === r.room_id ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                  {selectedRoomId && session && (
                    <MatrixChatBox
                      roomId={selectedRoomId}
                      accessToken={session.access_token}
                      currentUserId={session.user_id}
                      otherName="Seller"
                    />
                  )}
                </>
              )}
      </div>
    )
  }

  if (!TALKJS_APP_ID) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
        Chat is not configured.
      </div>
    )
  }

  return (
    <div className="max-w-full h-[655px]">
      <Inbox
        loadingComponent={
          <div className="h-96 w-full flex items-center justify-center" data-testid="user-messages-loading">
            Loading..
          </div>
        }
        syncConversation={syncConversation}
        className="h-full max-w-[760px] w-full"
      />
    </div>
  )
}
