export function getOrbitAppBaseUrl () {
  const fromEnv = process.env.NEXT_PUBLIC_ORBIT_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (process.env.NODE_ENV === 'production') return 'https://orbit.tese.io'
  return 'http://localhost:4201'
}

export function buildOrbitOrganizationUrl (locale: string, profileHandle: string) {
  const base = getOrbitAppBaseUrl()
  const loc = String(locale || 'en').replace(/^\//, '').split('/')[0] || 'en'
  return `${base}/${loc}/organization/${encodeURIComponent(profileHandle)}`
}
