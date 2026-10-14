import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { SITE_NAME } from '@/lib/constants/brand'
import { getTranslations } from 'next-intl/server'

type AuthChromeProps = {
  children: React.ReactNode
}

export async function AuthChrome ({ children }: AuthChromeProps) {
  const t = await getTranslations("auth")
  const year = new Date().getFullYear()

  return (
    <div className="tese-auth-chrome">
      <div className="tese-auth-chrome-content">
        <header className="tese-auth-chrome-header">
          <LocalizedClientLink
            href="/"
            className="tese-auth-chrome-back"
          >
            Back to marketplace
          </LocalizedClientLink>
        </header>

        {children}

        <footer className="tese-auth-chrome-footer">
          <nav className="tese-auth-chrome-legal" aria-label="Legal">
            <LocalizedClientLink href="#">Terms &amp; Conditions</LocalizedClientLink>
            <LocalizedClientLink href="#">Privacy Policy</LocalizedClientLink>
          </nav>
          <p className="tese-auth-chrome-copy">
            © {year} {SITE_NAME}
          </p>
        </footer>
      </div>
    </div>
  )
}
