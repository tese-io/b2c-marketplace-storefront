"use client"

import { MatrixInbox } from "@/components/cells/MatrixInbox/MatrixInbox"

export const UserMessagesSection = () => {
  return (
    <div className="tese-messages-section">
      <MatrixInbox className="h-full" />
    </div>
  )
}
