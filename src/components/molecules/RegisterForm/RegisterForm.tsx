'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

import { AuthShell } from '@/components/sections/Auth/AuthShell'
import { TeseIoButton } from '@/components/sections/Auth/TeseIoButton'
import {
  getContinueWithTeseUrl,
  getTeseSignupUrl,
} from '@/lib/helpers/tese-auth-urls'

export function RegisterForm () {
  const searchParams = useSearchParams()
  const params = useParams()
  const locale = (params?.locale as string) || 'pl'
  const marketplacePath = searchParams.get('redirect') || '/user'
  const signupHref = getTeseSignupUrl(marketplacePath, locale)
  const loginHref = getContinueWithTeseUrl(marketplacePath, locale)

  return (
    <AuthShell
      title="Join tese.io"
      lead="Create one account to access the marketplace, your sustainability dashboard, and supplier tools."
      testId="register-page"
    >
      <div data-testid="register-form-container">
        <TeseIoButton
          href={signupHref}
          label="Create account on tese.io"
          testId="register-tese-signup-button"
        />
        <p className="tese-auth-helper">
          After signup, you&apos;ll return here automatically to open the marketplace.
        </p>
      </div>

      <div className="tese-auth-footer">
        <p className="tese-auth-footer-copy">
          Already have a tese.io account?{' '}
          <a
            href={loginHref}
            className="tese-auth-footer-link"
            data-testid="register-login-link"
          >
            Continue with tese.io
          </a>
        </p>
        <p className="tese-auth-footer-copy">
          <Link
            href="/login"
            className="tese-auth-footer-link"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
