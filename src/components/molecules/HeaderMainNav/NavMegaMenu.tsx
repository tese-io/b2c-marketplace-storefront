import type { ReactNode } from 'react'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { cn } from '@/lib/utils'

export function MegaMenuPanel({
  eyebrow,
  title,
  footerHref,
  footerLabel,
  onClose,
  wide = true,
  children,
}: {
  eyebrow: string
  title: string
  footerHref: string
  footerLabel: string
  onClose: () => void
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'tese-mega-menu absolute left-0 top-full z-50 mt-1',
        wide ? 'tese-mega-menu-wide' : 'tese-mega-menu-compact'
      )}
      role="menu"
    >
      <div className="tese-mega-menu-header">
        <p className="tese-mega-menu-eyebrow">
          <span className="tese-mega-menu-eyebrow-dot" aria-hidden />
          {eyebrow}
        </p>
        <p className="tese-mega-menu-heading">{title}</p>
      </div>
      <div className="tese-mega-menu-body">{children}</div>
      <div className="tese-mega-menu-footer">
        <LocalizedClientLink
          href={footerHref}
          className="tese-mega-menu-footer-link"
          onClick={onClose}
        >
          {footerLabel}
          <span aria-hidden>→</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export function MegaMenuLinkItem({
  href,
  title,
  description,
  icon,
  accent,
  accentSoft,
  onClose,
  className,
}: {
  href?: string
  title: string
  description?: string
  icon: ReactNode
  accent?: string
  accentSoft?: string
  onClose?: () => void
  className?: string
}) {
  const style = {
    ['--mega-accent' as string]: accent || 'rgb(var(--tese-ink))',
    ['--mega-accent-soft' as string]: accentSoft || 'rgba(var(--tese-lime), 0.12)',
  }

  const content = (
    <>
      <span className="tese-mega-menu-item-icon">{icon}</span>
      <span className="tese-mega-menu-item-text">
        <span className="tese-mega-menu-item-title">{title}</span>
        {description && (
          <span className="tese-mega-menu-item-desc">{description}</span>
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <LocalizedClientLink
        href={href}
        className={cn('tese-mega-menu-item', className)}
        style={style}
        onClick={onClose}
        role="menuitem"
      >
        {content}
      </LocalizedClientLink>
    )
  }

  return (
    <button
      type="button"
      className={cn('tese-mega-menu-item w-full text-left', className)}
      style={style}
      onClick={onClose}
      role="menuitem"
    >
      {content}
    </button>
  )
}
