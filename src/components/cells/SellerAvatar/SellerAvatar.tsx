import Image from 'next/image'
import clsx from 'clsx'

export const SellerAvatar = ({
  photo = '',
  size = 32,
  alt = '',
  variant = 'default',
  className,
}: {
  photo?: string
  size?: number
  alt?: string
  variant?: 'default' | 'hero'
  className?: string
}) => {
  const isHero = variant === 'hero'

  if (photo) {
    return (
      <Image
        src={decodeURIComponent(photo)}
        alt={alt}
        width={size}
        height={size}
        className={clsx(
          'shrink-0 object-cover',
          isHero ? 'tese-seller-avatar-img' : '',
          className
        )}
        style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
      />
    )
  }

  return (
    <div
      className={clsx(
        'tese-seller-avatar-fallback',
        isHero && 'tese-seller-avatar-fallback-hero',
        className
      )}
      style={isHero ? { width: size, height: size } : undefined}
      aria-hidden={!alt}
    >
      <span className="tese-seller-avatar-initial">
        {(alt || 'S').charAt(0).toUpperCase()}
      </span>
    </div>
  )
}
