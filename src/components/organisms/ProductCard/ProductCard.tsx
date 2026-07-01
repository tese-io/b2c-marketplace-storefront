"use client"

import Image from "next/image"
import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/lib/utils"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { Product } from "@/types/product"

export const ProductCard = ({
  product,
  className,
  variant = "default",
}: {
  product: HttpTypes.StoreProduct | Product,
  className?: string
  variant?: "default" | "marketplace"
}) => {
  if (!product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({ product: product as HttpTypes.StoreProduct })

  const productName = String(product.title || "Product")
  const meta = (product as HttpTypes.StoreProduct).metadata as Record<string, unknown> | undefined
  const isMarketplace = variant === "marketplace"

  return (
    <div
      className={cn(
        "relative group flex flex-col justify-between w-full lg:w-[calc(25%-1rem)] min-w-[260px]",
        isMarketplace
          ? "tese-card p-0 overflow-hidden cursor-pointer"
          : "border rounded-sm p-1",
        className
      )}
      data-testid="product-card"
      data-product-handle={product.handle}
    >
      <div className="relative w-full h-full bg-primary aspect-square" data-testid="product-card-image-container">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`View ${productName}`}
          title={`View ${productName}`}
          data-testid="product-card-link"
        >
          <div className="overflow-hidden rounded-sm w-full h-full flex justify-center align-center ">
            {product.thumbnail ? (
              <Image
                priority
                fetchPriority="high"
                src={decodeURIComponent(product.thumbnail)}
                alt={`${productName} image`}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover aspect-square w-full object-center h-full lg:group-hover:-mt-14 transition-all duration-300 rounded-xs"
                data-testid="product-card-image"
              />
            ) : (
              <Image
                priority
                fetchPriority="high"
                src="/images/placeholder.svg"
                alt={`${productName} image placeholder`}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                data-testid="product-card-placeholder-image"
              />
            )}
          </div>
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`See more about ${productName}`}
          title={`See more about ${productName}`}
        >
          <Button className={cn(
            "absolute rounded-sm bg-action text-action-on-primary h-auto lg:h-[48px] lg:group-hover:block hidden w-full uppercase bottom-1 z-10",
            isMarketplace && "rounded-b-xl rounded-t-none lg:rounded-xl mx-2 mb-2 w-[calc(100%-1rem)]"
          )} data-testid="product-card-see-more-button">
            {isMarketplace ? "View & quote" : "See More"}
          </Button>
        </LocalizedClientLink>
      </div>
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={`Go to ${productName} page`}
        title={`Go to ${productName} page`}
      >
        <div className={cn("flex justify-between", isMarketplace ? "p-4 pt-3" : "p-4")} data-testid="product-card-info">
          <div className="w-full min-w-0">
            <h3 className={cn("truncate", isMarketplace ? "font-semibold text-[15px] text-primary" : "heading-sm")} data-testid="product-card-title">{product.title}</h3>
            {isMarketplace && meta?.moq && (
              <p className="text-[11px] text-secondary mt-1 truncate">
                MOQ {String(meta.moq)}{meta.unit ? ` · ${String(meta.unit)}` : ""}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2" data-testid="product-card-price">
              <p className={cn("font-semibold", isMarketplace && "text-tese-ice")} data-testid="product-card-current-price">{cheapestPrice?.calculated_price}</p>
              {cheapestPrice?.calculated_price !==
                cheapestPrice?.original_price && (
                <p className="text-sm text-gray-500 line-through" data-testid="product-card-original-price">
                  {cheapestPrice?.original_price}
                </p>
              )}
            </div>
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
