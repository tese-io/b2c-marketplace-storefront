import type { ReactNode } from 'react'

import { TeseLogo } from '@/components/atoms/TeseLogo/TeseLogo'
import { AuthCardAmbient } from '@/components/sections/Auth/AuthCardAmbient'

type AuthShellProps = {
  title: string
  lead: string
  children: ReactNode
  footer?: ReactNode
  testId?: string
}

export function AuthShell ({
  title,
  lead,
  children,
  footer,
  testId,
}: AuthShellProps) {
  return (
    <main className="tese-auth-page" data-testid={testId}>
      <AuthCardAmbient>
        <div className="tese-auth-card" data-testid={`${testId}-card`}>
          <div className="tese-auth-brand">
            <TeseLogo variant="dark" className="tese-auth-brand-logo" />
          </div>

          <div className="tese-auth-heading">
            <h1 className="tese-auth-title">{title}</h1>
            <p className="tese-auth-lead">{lead}</p>
          </div>

          {children}

          {footer ? (
            <div className="tese-auth-footer">{footer}</div>
          ) : null}
        </div>
      </AuthCardAmbient>
    </main>
  )
}
