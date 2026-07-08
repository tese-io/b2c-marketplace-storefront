import type { HttpTypes } from '@medusajs/types'

export type TeseProfileAddress = {
  address_name: string
  first_name: string
  last_name: string
  company: string
  address_1: string
  address_2: string
  city: string
  province: string
  postal_code: string
  country_code: string
  phone: string
}

export type TeseProfileAddressResponse = {
  status: boolean
  data: {
    address: TeseProfileAddress
    source: string
  } | null
  msg: string
}

function normalizePart (value?: string | null) {
  return String(value || '').trim().toLowerCase()
}

export function addressFingerprint (address: {
  address_1?: string | null
  postal_code?: string | null
  country_code?: string | null
  city?: string | null
}) {
  return [
    normalizePart(address.address_1),
    normalizePart(address.postal_code),
    normalizePart(address.country_code),
    normalizePart(address.city),
  ].join('|')
}

export function isDuplicateAddress (
  candidate: TeseProfileAddress,
  existing: HttpTypes.StoreCustomerAddress[]
) {
  const fingerprint = addressFingerprint(candidate)
  return existing.some((item) => fingerprint === addressFingerprint(item))
}

export function toMedusaAddressInput (
  address: TeseProfileAddress,
  options: { isDefaultShipping?: boolean } = {}
) {
  return {
    address_name: address.address_name || 'Tese profile',
    first_name: address.first_name,
    last_name: address.last_name,
    company: address.company || undefined,
    address_1: address.address_1,
    address_2: address.address_2 || undefined,
    city: address.city,
    province: address.province || undefined,
    postal_code: address.postal_code,
    country_code: address.country_code,
    phone: address.phone || undefined,
    is_default_shipping: options.isDefaultShipping ?? false,
    is_default_billing: false,
  }
}
