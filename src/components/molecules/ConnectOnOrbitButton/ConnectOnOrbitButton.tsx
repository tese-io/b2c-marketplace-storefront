import clsx from 'clsx'

type ConnectOnOrbitButtonProps = {
  url?: string | null
  className?: string
}

export function ConnectOnOrbitButton ({ url, className }: ConnectOnOrbitButtonProps) {
  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx('tese-seller-orbit-btn', 'tese-seller-action-btn', 'tese-seller-action-btn-orbit', className)}
    >
      Connect on Orbit
    </a>
  )
}
