import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

type SourcingPlaceholderViewProps = {
  title: string
  description: string
  actionLabel: string
  actionHref: string
  icon: 'inquiries' | 'lists' | 'messages'
}

function PlaceholderIcon({ type }: { type: SourcingPlaceholderViewProps['icon'] }) {
  if (type === 'lists') {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
        <rect x="12" y="10" width="40" height="44" rx="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M22 22h20M22 32h20M22 42h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'messages') {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
        <path
          d="M12 18a6 6 0 016-6h28a6 6 0 016 6v16a6 6 0 01-6 6H26l-10 8V18z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect x="14" y="8" width="36" height="48" rx="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 20h20M22 28h20M22 36h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function SourcingPlaceholderView({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: SourcingPlaceholderViewProps) {
  return (
    <div className="tese-sourcing-placeholder">
      <div className="tese-sourcing-placeholder-icon">
        <PlaceholderIcon type={icon} />
      </div>
      <h1 className="tese-sourcing-placeholder-title">{title}</h1>
      <p className="tese-sourcing-placeholder-desc">{description}</p>
      <LocalizedClientLink href={actionHref} className="tese-sourcing-placeholder-cta">
        {actionLabel}
      </LocalizedClientLink>
    </div>
  )
}
