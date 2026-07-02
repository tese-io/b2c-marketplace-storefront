'use client'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { ConnectOnOrbitButton } from '@/components/molecules/ConnectOnOrbitButton/ConnectOnOrbitButton'
import { Modal, ReportSellerForm } from '@/components/molecules'
import { Chat } from '@/components/organisms/Chat/Chat'
import { HttpTypes } from '@medusajs/types'
import { SellerProps } from '@/types/seller'
import { useState } from 'react'

type SellerHeroActionsProps = {
  seller: SellerProps
  user: HttpTypes.StoreCustomer | null
  orbitUrl?: string | null
}

export function SellerHeroActions ({
  seller,
  user,
  orbitUrl
}: SellerHeroActionsProps) {
  const [openModal, setOpenModal] = useState(false)
  const loginHref = `/login?redirect=${encodeURIComponent(`/sellers/${seller.handle}`)}`

  return (
    <aside className="tese-seller-actions">
      <p className="tese-seller-actions-label">Connect</p>
      <div className="tese-seller-actions-stack">
        {user ? (
          <Chat
            user={user}
            seller={seller}
            buttonClassNames="tese-seller-action-btn tese-seller-action-btn-primary"
            variant="filled"
            buttonSize="small"
          />
        ) : (
          <LocalizedClientLink
            href={loginHref}
            className="tese-seller-action-btn tese-seller-action-btn-primary"
          >
            Sign in to message
          </LocalizedClientLink>
        )}
        <ConnectOnOrbitButton
          url={orbitUrl}
          className="tese-seller-action-btn tese-seller-action-btn-orbit"
        />
        <LocalizedClientLink
          href="/sourcing"
          className="tese-seller-action-btn tese-seller-action-btn-secondary"
        >
          AI sourcing
        </LocalizedClientLink>
      </div>
      <button
        type="button"
        className="tese-seller-report-link"
        onClick={() => setOpenModal(true)}
      >
        Report seller
      </button>
      {openModal && (
        <Modal heading="Report seller" onClose={() => setOpenModal(false)}>
          <ReportSellerForm onClose={() => setOpenModal(false)} />
        </Modal>
      )}
    </aside>
  )
}
