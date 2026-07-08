'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { AddressForm } from '@/components/molecules'
import { emptyDefaultAddressValues } from '@/components/molecules/AddressForm/AddressForm'
import type { AddressFormData } from '@/components/molecules/AddressForm/schema'
import { WorkspaceAccountEmpty } from '@/components/sections/SourcingAppShell/WorkspaceAccountEmpty'
import { WorkspaceModal } from '@/components/sections/SourcingAppShell/WorkspaceModal'
import { deleteCustomerAddress } from '@/lib/data/customer'
import { importAddressFromTese } from '@/lib/data/import-tese-address'
import type { HttpTypes } from '@medusajs/types'
import { isEmpty } from 'lodash'

function AddressPinIcon () {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s6-5.33 6-10a6 6 0 10-12 0c0 4.67 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={11} r={2.25} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function formatAddressLine (
  address: HttpTypes.StoreCustomerAddress,
  countryName?: string | null
) {
  const cityLine = [address.postal_code, address.city, address.province]
    .filter(Boolean)
    .join(' ')
  const country = countryName || address.country_code?.toUpperCase()
  return [address.address_1, cityLine, country].filter(Boolean).join(', ')
}

export function Addresses ({
  user,
  regions,
}: {
  user: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [deleteAddress, setDeleteAddress] = useState<string | null>(null)
  const [defaultValues, setDefaultValues] = useState<AddressFormData | null>(null)
  const [fetchMessage, setFetchMessage] = useState<string | null>(null)
  const [fetchMessageIsError, setFetchMessageIsError] = useState(false)
  const [isFetching, startFetchTransition] = useTransition()
  const router = useRouter()

  const countries = regions.flatMap((region) => region.countries)

  const handleFetchFromTese = () => {
    if (isFetching) return
    setFetchMessage(null)
    setFetchMessageIsError(false)
    startFetchTransition(async () => {
      const result = await importAddressFromTese()
      setFetchMessage(result.message)
      setFetchMessageIsError(!result.success)
      if (result.success && result.imported) {
        router.refresh()
      }
    })
  }

  const fetchButton = (
    <button
      type="button"
      onClick={handleFetchFromTese}
      disabled={isFetching}
      className="tese-inquiry-btn-secondary tese-address-fetch-btn"
      data-testid="addresses-fetch-from-tese-button"
    >
      {isFetching ? 'Fetching…' : 'Fetch from tese.io'}
    </button>
  )

  const handleEdit = (addressId: string) => {
    const address = user.addresses.find((item) => item.id === addressId)
    if (address) {
      setDefaultValues({
        addressId,
        addressName: address.address_name || '',
        firstName: address.first_name || '',
        lastName: address.last_name || '',
        address: address.address_1 || '',
        city: address.city || '',
        countryCode: address.country_code || '',
        postalCode: address.postal_code || '',
        company: address.company || '',
        province: address.province || '',
        phone: address.phone || user.phone || '',
      })
      setShowForm(true)
    }
  }

  const handleDelete = async (addressId: string) => {
    await deleteCustomerAddress(addressId)
    setDeleteAddress(null)
  }

  const handleAdd = () => {
    setDefaultValues(emptyDefaultAddressValues)
    setDeleteAddress(null)
    setShowForm(true)
  }

  const formHeading = defaultValues?.addressId
    ? `Edit ${defaultValues.addressName || 'address'}`
    : 'Add address'

  return (
    <>
      <div className="tese-sourcing-account-body" data-testid="addresses-container">
        {fetchMessage ? (
          <p
            className={
              fetchMessageIsError
                ? 'tese-address-fetch-message tese-address-fetch-message-error'
                : 'tese-address-fetch-message'
            }
            role="status"
            data-testid="addresses-fetch-message"
          >
            {fetchMessage}
          </p>
        ) : null}

        {isEmpty(user.addresses) ? (
          <WorkspaceAccountEmpty
            title="No saved shipping addresses"
            description="Add a delivery address to speed up checkout and keep order updates accurate."
            primaryLabel="Add address"
            primaryOnClick={handleAdd}
            secondaryLabel={isFetching ? 'Fetching…' : 'Fetch from tese.io'}
            secondaryOnClick={handleFetchFromTese}
            secondaryDisabled={isFetching}
            icon={<AddressPinIcon />}
            testId="addresses-empty-state"
          />
        ) : (
          <>
            <div className="tese-address-toolbar">
              <p className="tese-address-toolbar-count">
                {user.addresses.length} saved address
                {user.addresses.length === 1 ? '' : 'es'}
              </p>
              <div className="tese-address-toolbar-actions">
                {fetchButton}
                {user.addresses.length < 6 ? (
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="tese-inquiry-btn-primary"
                    data-testid="addresses-add-button"
                  >
                    Add address
                  </button>
                ) : null}
              </div>
            </div>

            <ul className="tese-address-list" data-testid="addresses-list">
              {user.addresses.map((address) => {
                const countryName = countries.find(
                  (country) => country && country.iso_2 === address.country_code
                )?.display_name

                return (
                  <li
                    key={address.id}
                    className="tese-address-card"
                    data-testid={`address-card-${address.id}`}
                  >
                    <div className="tese-address-card-main">
                      <span className="tese-address-card-icon" aria-hidden>
                        <AddressPinIcon />
                      </span>
                      <div className="tese-address-card-copy">
                        <div className="tese-address-card-head">
                          <h3
                            className="tese-address-card-title"
                            data-testid={`address-${address.id}-name`}
                          >
                            {address.address_name || 'Shipping address'}
                          </h3>
                          {address.is_default_shipping ? (
                            <span className="tese-address-card-badge">Default</span>
                          ) : null}
                        </div>
                        <p
                          className="tese-address-card-name"
                          data-testid={`address-${address.id}-full-name`}
                        >
                          {`${address.first_name || ''} ${address.last_name || ''}`.trim()}
                        </p>
                        {address.company ? (
                          <p
                            className="tese-address-card-line"
                            data-testid={`address-${address.id}-company`}
                          >
                            {address.company}
                          </p>
                        ) : null}
                        <p
                          className="tese-address-card-line"
                          data-testid={`address-${address.id}-full-address`}
                        >
                          {formatAddressLine(address, countryName)}
                        </p>
                        <p
                          className="tese-address-card-contact"
                          data-testid={`address-${address.id}-contact`}
                        >
                          {[user.email, address.phone || user.phone]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="tese-address-card-actions">
                      <button
                        type="button"
                        onClick={() => handleEdit(address.id)}
                        className="tese-inquiry-btn-secondary"
                        data-testid={`address-edit-button-${address.id}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteAddress(address.id)}
                        className="tese-address-btn-danger"
                        data-testid={`address-delete-button-${address.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      {showForm ? (
        <WorkspaceModal
          heading={formHeading}
          onClose={() => setShowForm(false)}
          testId="address-form-modal"
        >
          <AddressForm
            regions={regions}
            handleClose={() => setShowForm(false)}
            defaultValues={defaultValues || emptyDefaultAddressValues}
          />
        </WorkspaceModal>
      ) : null}

      {deleteAddress ? (
        <WorkspaceModal
          heading="Delete address?"
          onClose={() => setDeleteAddress(null)}
          testId="address-delete-modal"
        >
          <div className="tese-address-delete-dialog">
            <p className="tese-address-delete-copy">
              This address will be removed from your account. You can add it again
              anytime before checkout.
            </p>
            <div className="tese-address-delete-actions">
              <button
                type="button"
                onClick={() => setDeleteAddress(null)}
                className="tese-inquiry-btn-secondary"
                data-testid="address-delete-cancel-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteAddress)}
                className="tese-address-btn-danger"
                data-testid="address-delete-confirm-button"
              >
                Delete address
              </button>
            </div>
          </div>
        </WorkspaceModal>
      ) : null}
    </>
  )
}
