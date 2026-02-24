"use client"

import { Badge } from "@/components/atoms"
import { MessageIcon } from "@/icons"
import LocalizedClientLink from "../LocalizedLink/LocalizedLink"
import { useUnreads } from "@talkjs/react"

const MATRIX_CHAT_ENABLED = process.env.NEXT_PUBLIC_MATRIX_CHAT_ENABLED === 'true'

export function MessageButton () {
  const unreads = useUnreads()
  const displayUnreads = MATRIX_CHAT_ENABLED ? [] : (unreads ?? [])

  return (
    <LocalizedClientLink href="/user/messages" className="relative">
      <MessageIcon size={20} />
      {Boolean(displayUnreads?.length) && (
        <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0">
          {displayUnreads.length}
        </Badge>
      )}
    </LocalizedClientLink>
  )
}
