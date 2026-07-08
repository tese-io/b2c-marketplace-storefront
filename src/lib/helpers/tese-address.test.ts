import { describe, expect, it } from 'vitest'

import {
  addressFingerprint,
  isDuplicateAddress,
  type TeseProfileAddress,
} from './tese-address'

const sample: TeseProfileAddress = {
  address_name: 'Tese profile',
  first_name: 'Ayan',
  last_name: 'R',
  company: '',
  address_1: '12 Market Street',
  address_2: '',
  city: 'London',
  province: 'England',
  postal_code: 'EC1A 1BB',
  country_code: 'gb',
  phone: '+441234567890',
}

describe('tese-address helpers', () => {
  it('builds a stable fingerprint', () => {
    expect(addressFingerprint(sample)).toBe(
      addressFingerprint({ ...sample, address_1: ' 12 Market Street ' })
    )
  })

  it('detects duplicate saved addresses', () => {
    expect(
      isDuplicateAddress(sample, [
        {
          id: 'addr_1',
          address_1: '12 Market Street',
          postal_code: 'EC1A 1BB',
          country_code: 'gb',
          city: 'London',
        },
      ])
    ).toBe(true)
  })

  it('allows import when no matching address exists', () => {
    expect(
      isDuplicateAddress(sample, [
        {
          id: 'addr_2',
          address_1: '99 Other Road',
          postal_code: 'SW1A 1AA',
          country_code: 'gb',
          city: 'London',
        },
      ])
    ).toBe(false)
  })
})
