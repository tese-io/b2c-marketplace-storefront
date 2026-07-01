'use client'

import { HttpTypes } from '@medusajs/types'
import Image from 'next/image'
import { useState } from 'react'

export function B2BProductGallery({
  images,
  title,
}: {
  images: HttpTypes.StoreProduct['images']
  title: string
}) {
  const slides = images?.length ? images : []
  const [active, setActive] = useState(0)

  if (!slides.length) {
    return (
      <div className="tese-pdp-gallery tese-pdp-gallery-empty">
        <Image
          src="/images/placeholder.svg"
          alt=""
          width={700}
          height={700}
          className="tese-pdp-gallery-main opacity-30"
        />
      </div>
    )
  }

  const current = slides[Math.min(active, slides.length - 1)]

  return (
    <div className="tese-pdp-gallery">
      <div className="tese-pdp-gallery-main-wrap">
        <Image
          priority
          src={decodeURIComponent(current.url)}
          alt={title}
          width={900}
          height={900}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="tese-pdp-gallery-main"
        />
      </div>
      {slides.length > 1 && (
        <div className="tese-pdp-gallery-thumbs" role="tablist" aria-label="Product images">
          {slides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              type="button"
              role="tab"
              aria-selected={idx === active}
              aria-label={`View image ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`tese-pdp-gallery-thumb ${idx === active ? 'tese-pdp-gallery-thumb-active' : ''}`}
            >
              <Image
                src={decodeURIComponent(slide.url)}
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
