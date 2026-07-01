'use client'

import { usePathname } from 'next/navigation'

import { HeaderSearch } from '@/components/molecules/HeaderSearch/HeaderSearch'
import { cn } from '@/lib/utils'

type HeaderSearchNavProps = {
  className?: string
  variant?: 'default' | 'metalbook'
  layout?: 'desktop' | 'mobile'
}

function isLandingPath (pathname: string) {
  return /^\/[a-z]{2}\/?$/.test(pathname)
}

export function HeaderSearchNav ({
  className = '',
  variant = 'default',
  layout = 'desktop',
}: HeaderSearchNavProps) {
  const pathname = usePathname()

  if (isLandingPath(pathname)) return null

  if (layout === 'mobile') {
    return (
      <div className="lg:hidden px-4 pb-3">
        <HeaderSearch variant={variant} />
      </div>
    )
  }

  return (
    <div className={cn('hidden lg:flex flex-1 justify-center min-w-0 px-4', className)}>
      <HeaderSearch className="w-full max-w-2xl" variant={variant} />
    </div>
  )
}
