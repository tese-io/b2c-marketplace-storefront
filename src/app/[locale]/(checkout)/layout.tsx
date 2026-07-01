import { TeseLogo } from '@/components/atoms/TeseLogo/TeseLogo'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { CollapseIcon } from '@/icons'

export default async function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="tese-checkout-app">
      <header className="tese-checkout-header">
        <div className="tese-container tese-checkout-header-inner">
          <LocalizedClientLink href="/cart" className="tese-checkout-back">
            <CollapseIcon className="rotate-90" size={18} />
            <span>Back to cart</span>
          </LocalizedClientLink>
          <TeseLogo variant="dark" />
        </div>
      </header>
      {children}
    </div>
  )
}
