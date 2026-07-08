'use server'

import { sdk } from '../config'
import {
  isDuplicateAddress,
  toMedusaAddressInput,
  type TeseProfileAddressResponse,
} from '../helpers/tese-address'
import { storefrontBffFetch } from '../storefront-bff'
import { getAuthHeaders, getCacheTag } from './cookies'
import { retrieveCustomer } from './customer'
import { revalidateTag } from 'next/cache'

export async function importAddressFromTese (): Promise<{
  success: boolean
  imported: boolean
  message: string
}> {
  const headers = {
    ...(await getAuthHeaders())
  }

  if (!headers.authorization) {
    return {
      success: false,
      imported: false,
      message: 'Sign in to import your tese address',
    }
  }

  const customer = await retrieveCustomer()
  if (!customer) {
    return {
      success: false,
      imported: false,
      message: 'Sign in to import your tese address',
    }
  }

  const { ok, json } = await storefrontBffFetch<TeseProfileAddressResponse>(
    '/profile/address',
    { method: 'GET' }
  )

  const envelope = json as TeseProfileAddressResponse
  if (!ok || !envelope?.status || !envelope.data?.address) {
    const rawMessage = envelope?.msg || ''
    const isTechnicalError = /is not a function|TypeError|ReferenceError/i.test(rawMessage)
    return {
      success: false,
      imported: false,
      message: isTechnicalError
        ? 'Could not load an address from your tese.io profile. Please try again later.'
        : rawMessage || 'Could not load an address from your tese.io profile',
    }
  }

  const candidate = envelope.data.address
  if (isDuplicateAddress(candidate, customer.addresses || [])) {
    return {
      success: true,
      imported: false,
      message: 'This tese address is already saved here',
    }
  }

  const isFirstAddress = (customer.addresses || []).length === 0
  const addressInput = toMedusaAddressInput(candidate, {
    isDefaultShipping: isFirstAddress,
  })

  try {
    await sdk.store.customer.createAddress(addressInput, {}, headers)
    const customerCacheTag = await getCacheTag('customers')
    revalidateTag(customerCacheTag)
    return {
      success: true,
      imported: true,
      message: 'Address imported from your tese profile',
    }
  } catch (error: unknown) {
    return {
      success: false,
      imported: false,
      message: (error as Error)?.message || 'Could not save the imported address',
    }
  }
}
