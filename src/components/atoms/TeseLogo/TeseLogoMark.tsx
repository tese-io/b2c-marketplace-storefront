import Image from 'next/image'

type TeseLogoMarkProps = {
  size?: number
  className?: string
}

export function TeseLogoMark ({ size, className = '' }: TeseLogoMarkProps) {
  const width = size ?? 32
  const height = size ? Math.round(size * (760 / 660)) : 37

  return (
    <Image
      src="/logo.svg"
      alt=""
      width={width}
      height={height}
      className={`shrink-0 object-contain ${className}`}
      aria-hidden
    />
  )
}
