type WorkspaceAccountPageProps = {
  title?: string
  lead?: string
  children: React.ReactNode
  testId?: string
  className?: string
}

export function WorkspaceAccountPage ({
  title,
  lead,
  children,
  testId,
  className = '',
}: WorkspaceAccountPageProps) {
  return (
    <div
      className={`tese-sourcing-account ${className}`.trim()}
      data-testid={testId}
    >
      {title ? (
        <header className="tese-sourcing-account-header">
          <h1 className="tese-sourcing-account-title">{title}</h1>
          {lead ? (
            <p className="tese-sourcing-account-lead">{lead}</p>
          ) : null}
        </header>
      ) : null}
      {children}
    </div>
  )
}
