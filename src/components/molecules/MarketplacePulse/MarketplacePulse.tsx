'use client'

import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { MARKETPLACE_PULSE } from '@/data/marketplace-pulse'
import { useTranslations } from 'next-intl'

function PulseItem ({
  headline,
  detail,
  href,
}: {
  headline: string
  detail?: string
  href?: string
}) {
  const content = (
    <>
      <span className="font-semibold text-white">{headline}</span>
      {detail ? (
        <span className="text-white/65 before:content-['·'] before:mx-2">{detail}</span>
      ) : null}
    </>
  )

  if (href) {
    return (
      <LocalizedClientLink
        href={href}
        className="inline-flex items-center text-[11px] hover:text-tese-lime transition-colors"
      >
        {content}
      </LocalizedClientLink>
    )
  }

  return <span className="inline-flex items-center text-[11px]">{content}</span>
}

export function MarketplacePulse () {
  const t = useTranslations()
  const items = [...MARKETPLACE_PULSE, ...MARKETPLACE_PULSE]

  return (
    <div className="bg-tese-ink text-white overflow-hidden border-b border-white/10">
      <div className="tese-container flex items-center gap-4 py-2">
        <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em] text-tese-lime">
          {t('header.marketplacePulse')}
        </span>
        <div className="overflow-hidden flex-1 mask-fade-x">
          <div className="tese-marquee gap-12">
            {items.map((item, index) => (
              <PulseItem
                key={`${item.id}-${index}`}
                headline={t(`pulse.${item.key}.headline`)}
                detail={t(`pulse.${item.key}.detail`)}
                href={item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
