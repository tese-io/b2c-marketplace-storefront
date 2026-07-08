'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

import { Alert } from '@/components/atoms/Alert/Alert'
import { AuthShell } from '@/components/sections/Auth/AuthShell'
import { TeseIoButton } from '@/components/sections/Auth/TeseIoButton'
import {
  getContinueWithTeseUrl,
  getTeseSignupUrl,
} from '@/lib/helpers/tese-auth-urls'

function getStatusMessage (searchParams: URLSearchParams) {
  if (searchParams.get('sessionExpired') === 'true') {
    return 'Your session has expired. Sign in with tese.io to continue.'
  }
  if (searchParams.get('sessionRequired') === 'true') {
    return 'Please sign in to continue.'
  }
  if (searchParams.get('error') === 'sso_missing_key') {
    return 'Sign-in could not be completed. Please try again.'
  }
  if (searchParams.get('error') === 'sso_failed') {
    return 'tese.io sign-in failed. Please try again.'
  }
  return null
}

export function LoginForm () {
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as string) || 'pl'
  const marketplacePath = searchParams.get('redirect') || '/user'
  const statusMessage = getStatusMessage(searchParams)
  const continueHref = getContinueWithTeseUrl(marketplacePath, locale)
  const signupHref = getTeseSignupUrl(marketplacePath, locale)

  return (
    <AuthShell
      title="Sign in to the marketplace"
      lead="One tese.io account for sourcing, orders, and your profile."
      testId="login-page"
    >
      {statusMessage ? (
        <Alert
          title={statusMessage}
          className="tese-auth-alert"
          icon
          data-testid="login-auth-alert"
        />
      ) : null}

      <div data-testid="login-form-container">
        <TeseIoButton
          href={continueHref}
          testId="login-continue-with-tese"
        />
        <p className="tese-auth-helper">
          Sign in with your tese.io account — no separate marketplace password.
        </p>
      </div>

      <div className="tese-auth-footer">
        <p className="tese-auth-footer-copy">
          New to tese.io?{' '}
          <a
            href={signupHref}
            className="tese-auth-footer-link"
            data-testid="login-register-link"
          >
            Create an account
          </a>
        </p>
        <p className="tese-auth-footer-copy">
          <Link
            href="/register"
            className="tese-auth-footer-link"
          >
            Learn about joining tese.io
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
