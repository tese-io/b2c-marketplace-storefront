import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'

type WorkspaceAccountEmptyProps = {
  title: string
  description: string
  primaryLabel?: string
  primaryHref?: string
  secondaryLabel?: string
  secondaryHref?: string
  testId?: string
}

export function WorkspaceAccountEmpty ({
  title,
  description,
  primaryLabel = 'Start AI Sourcing',
  primaryHref = '/sourcing',
  secondaryLabel,
  secondaryHref,
  testId,
}: WorkspaceAccountEmptyProps) {
  return (
    <div className="tese-sourcing-account-empty" data-testid={testId}>
      <h2 className="tese-sourcing-account-empty-title">{title}</h2>
      <p className="tese-sourcing-account-empty-desc">{description}</p>
      <div className="tese-sourcing-account-empty-actions">
        <LocalizedClientLink
          href={primaryHref}
          className="tese-sourcing-placeholder-cta"
        >
          {primaryLabel}
        </LocalizedClientLink>
        {secondaryLabel && secondaryHref ? (
          <LocalizedClientLink
            href={secondaryHref}
            className="tese-sourcing-account-empty-secondary"
          >
            {secondaryLabel}
          </LocalizedClientLink>
        ) : null}
      </div>
    </div>
  )
}
