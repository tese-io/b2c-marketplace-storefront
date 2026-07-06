"use client"

import { MatrixInbox } from "@/components/cells/MatrixInbox/MatrixInbox"

export const UserMessagesSection = () => {
  return (
    <div className="max-w-full h-[calc(100dvh-220px)] min-h-[480px]">
      <MatrixInbox className="h-full" />
    </div>
  )
}
