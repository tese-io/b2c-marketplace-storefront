'use client'

import { Button } from '@/components/atoms'
import { ChatBox } from '@/components/cells/ChatBox/ChatBox'
import { MatrixChatBox } from '@/components/cells/MatrixChatBox/MatrixChatBox'
import { Modal } from '@/components/molecules'
import { getChatRoom, getMatrixToken } from '@/lib/data/chat'
import { HttpTypes } from '@medusajs/types'
import { SellerProps } from '@/types/seller'
import { MessageIcon } from '@/icons'
import Link from 'next/link'
import { useCallback, useState } from 'react'

const TALKJS_APP_ID = process.env.NEXT_PUBLIC_TALKJS_APP_ID || ''
const MATRIX_CHAT_ENABLED = process.env.NEXT_PUBLIC_MATRIX_CHAT_ENABLED === 'true'

export function Chat ({
  user,
  seller,
  buttonClassNames,
  icon,
  product,
  subject,
  order_id,
  variant = 'tonal',
  buttonSize = 'small'
}: {
  user: HttpTypes.StoreCustomer | null
  seller: SellerProps
  buttonClassNames?: string
  icon?: boolean
  product?: HttpTypes.StoreProduct
  subject?: string
  order_id?: string
  variant?: 'tonal' | 'filled'
  buttonSize?: 'small' | 'large'
}) {
  const [modal, setModal] = useState(false)
  const [matrixSession, setMatrixSession] = useState<{
    access_token: string
    user_id: string
    room_id: string
  } | null>(null)
  const [matrixLoading, setMatrixLoading] = useState(false)
  const [matrixError, setMatrixError] = useState<string | null>(null)

  const openModal = useCallback(() => {
    setModal(true)
    if (!user) return
    if (MATRIX_CHAT_ENABLED) {
      setMatrixSession(null)
      setMatrixError(null)
      setMatrixLoading(true)
      Promise.all([
        getMatrixToken(),
        getChatRoom({
          seller_id: seller?.id ?? '',
          product_id: product?.id,
          order_id,
          room_name: subject || product?.title
        })
      ]).then(([token, room]) => {
        if (token?.access_token && token?.user_id && room?.room_id) {
          setMatrixSession({
            access_token: token.access_token,
            user_id: token.user_id,
            room_id: room.room_id
          })
        } else {
          setMatrixError('Could not start chat. Please try again.')
        }
      }).catch(() => {
        setMatrixError('Could not start chat. Please try again.')
      }).finally(() => {
        setMatrixLoading(false)
      })
    }
  }, [user, seller?.id, product?.id, order_id, subject, product?.title])

  if (!MATRIX_CHAT_ENABLED && !TALKJS_APP_ID) {
    return null
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={MATRIX_CHAT_ENABLED ? openModal : () => setModal(true)}
        className={buttonClassNames}
        size={buttonSize}
      >
        {icon ? <MessageIcon size={20} /> : 'Write to seller'}
      </Button>
      {modal && (
        <Modal heading="Chat" onClose={() => setModal(false)}>
          <div className="px-4">
            {!user
              ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                    <p className="text-secondary label-md">Please log in to message the seller.</p>
                    <Button asChild variant="filled" size="large">
                      <Link href="/login">Log in</Link>
                    </Button>
                  </div>
                )
              : MATRIX_CHAT_ENABLED
                ? (matrixLoading
                    ? <div className="flex h-[500px] w-full items-center justify-center text-sm text-gray-500">Loading chat…</div>
                    : matrixError
                      ? <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{matrixError}</div>
                      : matrixSession
                        ? (
                            <MatrixChatBox
                              roomId={matrixSession.room_id}
                              accessToken={matrixSession.access_token}
                              currentUserId={matrixSession.user_id}
                              otherName={seller?.name ?? 'Seller'}
                            />
                          )
                        : null)
                : (
                    <ChatBox
                      order_id={order_id}
                      product_id={product?.id}
                      subject={subject || product?.title || null}
                      currentUser={{
                        id: user.id,
                        name: `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || '',
                        email: user.email ?? null,
                        photoUrl: '/talkjs-placeholder.jpg',
                        role: 'customer'
                      }}
                      supportUser={{
                        id: seller?.id || '',
                        name: seller?.name || '',
                        email: seller?.email ?? null,
                        photoUrl: seller?.photo || '/talkjs-placeholder.jpg',
                        role: 'seller'
                      }}
                    />
                  )}
          </div>
        </Modal>
      )}
    </>
  )
}
