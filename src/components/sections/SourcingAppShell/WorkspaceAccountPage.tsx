type WorkspaceAccountPageProps = {
  title?: string
  children: React.ReactNode
  testId?: string
  className?: string
}

export function WorkspaceAccountPage ({
  title,
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
        <h1 className="tese-sourcing-account-title">{title}</h1>
      ) : null}
      {children}
    </div>
  )
}
