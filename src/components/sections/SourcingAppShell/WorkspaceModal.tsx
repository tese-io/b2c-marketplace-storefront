'use client'

type WorkspaceModalProps = {
  heading: string
  onClose: () => void
  children: React.ReactNode
  testId?: string
}

function CloseIcon () {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function WorkspaceModal ({
  heading,
  onClose,
  children,
  testId = 'modal',
}: WorkspaceModalProps) {
  return (
    <div
      className="tese-workspace-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="workspace-modal-title"
      data-testid={testId}
    >
      <button
        type="button"
        className="tese-workspace-modal-backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="tese-workspace-modal-panel">
        <header className="tese-workspace-modal-head">
          <h2 id="workspace-modal-title" className="tese-workspace-modal-title">
            {heading}
          </h2>
          <button
            type="button"
            className="tese-workspace-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="tese-workspace-modal-body">{children}</div>
      </div>
    </div>
  )
}
