"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/lib/utils"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { Product } from "@/types/product"

const PLACEHOLDER_IMAGE = "/images/product/placeholder.jpg"

export const ProductCard = ({
  product,
  className,
}: {
  product: HttpTypes.StoreProduct | Product,
  className?: string
}) => {
  const [imageError, setImageError] = useState(false)

  if (!product) {
    return null
  }

  let cheapestPrice: ReturnType<typeof getProductPrice>["cheapestPrice"] = null
  try {
    cheapestPrice = getProductPrice({ product: product as HttpTypes.StoreProduct }).cheapestPrice
  } catch {
    // Product may lack variants or have unexpected shape
  }
  const productName = String(product.title || "Product")
  const subtitle = (product as HttpTypes.StoreProduct & { subtitle?: string }).subtitle
  const showPlaceholder = !product.thumbnail || imageError
  const isService = (product as HttpTypes.StoreProduct & { metadata?: { listing_type?: string } }).metadata?.listing_type === 'service'

  return (
    <div
      className={cn(
        "relative group border border-border rounded-sm flex flex-col bg-primary overflow-hidden w-full lg:w-[calc(25%-1rem)] min-w-[250px]",
        className
      )}
      data-testid="product-card"
      data-product-handle={product.handle}
    >
      <div className="relative w-full bg-muted/30 aspect-square" data-testid="product-card-image-container">
        {isService && (
          <span className="absolute top-2 left-2 z-10 rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground uppercase" data-testid="product-card-service-badge">
            Service
          </span>
        )}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`View ${productName}`}
          title={productName}
          data-testid="product-card-link"
        >
          <div className="overflow-hidden rounded-t-sm w-full h-full flex items-center justify-center bg-muted/50">
            {showPlaceholder ? (
              <Image
                src={PLACEHOLDER_IMAGE}
                alt=""
                role="presentation"
                width={400}
                height={400}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover aspect-square w-full h-full"
                data-testid="product-card-placeholder-image"
              />
            ) : (
              <Image
                priority
                fetchPriority="high"
                src={decodeURIComponent(product.thumbnail)}
                alt={`${productName}`}
                width={400}
                height={400}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover aspect-square w-full object-center h-full lg:group-hover:scale-105 transition-transform duration-300"
                data-testid="product-card-image"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`See more about ${productName}`}
          title={`See more about ${productName}`}
        >
          <Button className="absolute rounded-sm bg-action text-action-on-primary h-auto py-2 lg:py-3 lg:group-hover:opacity-100 opacity-0 transition-opacity lg:block hidden w-[calc(100%-1rem)] bottom-2 left-2 right-2 z-10 uppercase text-sm font-medium" data-testid="product-card-see-more-button">
            See More
          </Button>
        </LocalizedClientLink>
      </div>
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={`Go to ${productName} page`}
        title={productName}
        className="flex flex-col flex-1"
      >
        <div className="flex flex-col gap-1.5 p-4 flex-1" data-testid="product-card-info">
          <h3 className="heading-sm line-clamp-2 text-foreground min-h-[2.5rem]" title={product.title} data-testid="product-card-title">
            {product.title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground line-clamp-1" title={subtitle}>
              {subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap" data-testid="product-card-price">
            {cheapestPrice?.calculated_price ? (
              <>
                <span className="font-semibold text-foreground" data-testid="product-card-current-price">
                  {cheapestPrice.calculated_price}
                </span>
                {cheapestPrice.original_price && cheapestPrice.calculated_price !== cheapestPrice.original_price && (
                  <span className="text-sm text-muted-foreground line-through" data-testid="product-card-original-price">
                    {cheapestPrice.original_price}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Price on request</span>
            )}
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
