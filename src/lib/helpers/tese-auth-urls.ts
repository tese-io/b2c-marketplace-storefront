const DEFAULT_DASHBOARD_URL = 'http://148.113.8.184:4200'
const DEFAULT_LOCALE = 'pl'
const DEFAULT_MARKETPLACE_PATH = '/user'

export function getDashboardUrl (): string {
  return (
    process.env.NEXT_PUBLIC_TESE_DASHBOARD_URL || DEFAULT_DASHBOARD_URL
  ).replace(/\/$/, '')
}

export function getManageAccountUrl (): string {
  return getDashboardUrl()
}

export function getContinueWithTeseUrl (
  marketplacePath: string = DEFAULT_MARKETPLACE_PATH,
  locale: string = DEFAULT_LOCALE
): string {
  const dashboardUrl = getDashboardUrl()
  const params = new URLSearchParams({
    path: marketplacePath,
    locale,
  })
  return `${dashboardUrl}/marketplace/enter?${params.toString()}`
}

export function getTeseSignupUrl (
  marketplacePath: string = DEFAULT_MARKETPLACE_PATH,
  locale: string = DEFAULT_LOCALE
): string {
  const dashboardUrl = getDashboardUrl()
  const enterParams = new URLSearchParams({
    path: marketplacePath,
    locale,
  })
  const returnPath = `/marketplace/enter?${enterParams.toString()}`
  return `${dashboardUrl}/sign-up?redirect=${encodeURIComponent(returnPath)}`
}
