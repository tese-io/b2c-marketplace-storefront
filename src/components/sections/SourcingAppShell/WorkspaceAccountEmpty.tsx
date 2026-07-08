import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

type WorkspaceAccountEmptyProps = {
  title: string
  description: string
  primaryLabel?: string
  primaryHref?: string
  primaryOnClick?: () => void
  secondaryLabel?: string
  secondaryHref?: string
  secondaryOnClick?: () => void
  secondaryDisabled?: boolean
  icon?: React.ReactNode
  testId?: string
}

export function WorkspaceAccountEmpty ({
  title,
  description,
  primaryLabel = 'Start AI Sourcing',
  primaryHref = '/sourcing',
  primaryOnClick,
  secondaryLabel,
  secondaryHref,
  secondaryOnClick,
  secondaryDisabled = false,
  icon,
  testId,
}: WorkspaceAccountEmptyProps) {
  return (
    <div className="tese-sourcing-account-empty" data-testid={testId}>
      {icon ? (
        <div className="tese-sourcing-account-empty-icon" aria-hidden>
          {icon}
        </div>
      ) : null}
      <h2 className="tese-sourcing-account-empty-title">{title}</h2>
      <p className="tese-sourcing-account-empty-desc">{description}</p>
      <div className="tese-sourcing-account-empty-actions">
        {primaryOnClick ? (
          <button
            type="button"
            onClick={primaryOnClick}
            className="tese-sourcing-placeholder-cta"
          >
            {primaryLabel}
          </button>
        ) : (
          <LocalizedClientLink
            href={primaryHref}
            className="tese-sourcing-placeholder-cta"
          >
            {primaryLabel}
          </LocalizedClientLink>
        )}
        {secondaryLabel && secondaryOnClick ? (
          <button
            type="button"
            onClick={secondaryOnClick}
            disabled={secondaryDisabled}
            className="tese-inquiry-btn-secondary tese-sourcing-account-empty-secondary"
          >
            {secondaryLabel}
          </button>
        ) : secondaryLabel && secondaryHref ? (
          <LocalizedClientLink
            href={secondaryHref}
            className="tese-inquiry-btn-secondary tese-sourcing-account-empty-secondary"
          >
            {secondaryLabel}
          </LocalizedClientLink>
        ) : null}
      </div>
    </div>
  )
}
