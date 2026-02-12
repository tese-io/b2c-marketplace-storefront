"use client"

import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { ProductVariants } from "@/components/molecules"
import useGetAllSearchParams from "@/hooks/useGetAllSearchParams"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { Chat } from "@/components/organisms/Chat/Chat"
import { SellerProps } from "@/types/seller"
import { WishlistButton } from "../WishlistButton/WishlistButton"
import { Wishlist } from "@/types/wishlist"
import { toast } from "@/lib/helpers/toast"
import { useCartContext } from "@/components/providers"

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce(
    (
      acc: Record<string, string>,
      varopt: HttpTypes.StoreProductOptionValue
    ) => {
      acc[varopt.option?.title.toLowerCase() || ""] = varopt.value

      return acc
    },
    {}
  )
}

export const ProductDetailsHeader = ({
  product,
  locale,
  user,
  wishlist,
}: {
  product: HttpTypes.StoreProduct & { seller?: SellerProps }
  locale: string
  user: HttpTypes.StoreCustomer | null
  wishlist?: Wishlist
}) => {
  const { addToCart, onAddToCart, cart, isAddingItem } = useCartContext()
  const { allSearchParams } = useGetAllSearchParams()

  const { cheapestVariant, cheapestPrice } = getProductPrice({
    product,
  })

  // Check if product has any valid prices in current region
  const hasAnyPrice = cheapestPrice !== null && cheapestVariant !== null

  // set default variant
  const selectedVariant = hasAnyPrice
    ? {
        ...optionsAsKeymap(cheapestVariant.options ?? null),
        ...allSearchParams,
      }
    : allSearchParams

  // get selected variant id
  const variantId =
    product.variants?.find(({ options }: { options: any }) =>
      options?.every((option: any) =>
        selectedVariant[option.option?.title.toLowerCase() || ""]?.includes(
          option.value
        )
      )
    )?.id || ""

  // get variant price
  const { variantPrice } = getProductPrice({
    product,
    variantId,
  })

  const variantStock =
    product.variants?.find(({ id }) => id === variantId)?.inventory_quantity ||
    0

  const variantHasPrice = !!product.variants?.find(({ id }) => id === variantId)
    ?.calculated_price

  const isVariantStockMaxLimitReached =
    (cart?.items?.find((item) => item.variant_id === variantId)?.quantity ??
      0) >= variantStock

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!variantId || !hasAnyPrice || isVariantStockMaxLimitReached) return

    const subtotal = +(variantPrice?.calculated_price_without_tax_number || 0)
    const total = +(variantPrice?.calculated_price_number || 0)

    const storeCartLineItem = {
      thumbnail: product.thumbnail || "",
      product_title: product.title,
      quantity: 1,
      subtotal,
      total,
      tax_total: total - subtotal,
      variant_id: variantId,
      product_id: product.id,
      variant: product.variants?.find(({ id }) => id === variantId),
    }

    // Optimistic update
    onAddToCart(storeCartLineItem, variantPrice?.currency_code || "eur")

    try {
      await addToCart({
        variantId: variantId,
        quantity: 1,
        countryCode: locale,
      })
    } catch (error) {
      toast.error({
        title: "Error adding to cart",
        description: "Some variant does not have the required inventory",
      })
    }
  }

  const isAddToCartDisabled = !variantStock || !variantHasPrice || !hasAnyPrice || isVariantStockMaxLimitReached

  const metadata = product?.metadata as { listing_type?: string; request_quote_only?: boolean; price_range_min?: number; price_range_max?: number; duration_text?: string } | undefined
  const isService = metadata?.listing_type === 'service'
  const requestQuoteOnly = !!metadata?.request_quote_only
  const priceMin = metadata?.price_range_min != null ? Number(metadata.price_range_min) : null
  const priceMax = metadata?.price_range_max != null ? Number(metadata.price_range_max) : null
  const hasPriceRange = isService && (priceMin != null || priceMax != null)
  const durationText = isService && metadata?.duration_text?.trim() ? metadata.duration_text.trim() : null

  return (
    <div className="border rounded-sm p-5" data-testid="product-details-header">
      <div className="flex justify-between">
        <div>
          <h2 className="label-md text-secondary">
            {/* {product?.brand || "No brand"} */}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="heading-lg text-primary" data-testid="product-title">{product.title}</h1>
            {isService && (
              <span className="rounded bg-primary/90 px-2 py-0.5 text-xs font-medium text-primary-foreground uppercase" data-testid="product-service-badge">
                Service
              </span>
            )}
          </div>
          {durationText && (
            <p className="mt-1 label-sm text-secondary" data-testid="product-duration">
              Duration: {durationText}
            </p>
          )}
          <div className="mt-2 flex flex-col gap-1" data-testid="product-price-container">
            {hasPriceRange && (
              <span className="label-md text-primary" data-testid="product-price-range">
                {priceMin != null && priceMax != null && priceMin > 0 && priceMax > 0
                  ? `€${priceMin} – €${priceMax}`
                  : priceMin != null && priceMin > 0
                    ? `From €${priceMin}`
                    : priceMax != null && priceMax > 0
                      ? `Up to €${priceMax}`
                      : null}
              </span>
            )}
            {hasAnyPrice && variantPrice && !hasPriceRange ? (
              <div className="flex gap-2 items-center">
                <span className="heading-md text-primary" data-testid="product-price-current">
                  {variantPrice.calculated_price}
                </span>
                {variantPrice.calculated_price_number !==
                  variantPrice.original_price_number && (
                  <span className="label-md text-secondary line-through" data-testid="product-price-original">
                    {variantPrice.original_price}
                  </span>
                )}
              </div>
            ) : !hasPriceRange ? (
              <span className="label-md text-secondary pt-2 pb-4" data-testid="product-price-unavailable">
                Not available in your region
              </span>
            ) : null}
          </div>
        </div>
        <div>
          {/* Add to Wishlist */}
          <WishlistButton
            productId={product.id}
            wishlist={wishlist}
            user={user}
          />
        </div>
      </div>
      {/* Product Variants */}
      {hasAnyPrice && (
        <ProductVariants product={product} selectedVariant={selectedVariant} />
      )}
      {/* Service: Request quote CTA (no direct booking link to preserve TESE commission) */}
      {isService && requestQuoteOnly && (
        <div className="flex flex-col gap-2 mb-4">
          <Button
            asChild
            variant="secondary"
            className="w-full uppercase py-3"
            size="large"
            data-testid="product-request-quote-button"
          >
            <a href={`mailto:${product.seller?.email || ''}?subject=Quote request: ${encodeURIComponent(product.title || '')}`}>
              Request quote
            </a>
          </Button>
        </div>
      )}
      {/* Add to Cart - hide when service is quote-only */}
      {!(isService && requestQuoteOnly) && (
        <Button
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          loading={isAddingItem}
          className="w-full uppercase mb-4 py-3 flex justify-center"
          size="large"
          data-testid="product-add-to-cart-button"
        >
          {!hasAnyPrice
            ? "NOT AVAILABLE IN YOUR REGION"
            : variantStock && variantHasPrice
            ? "ADD TO CART"
            : "OUT OF STOCK"}
        </Button>
      )}
      {/* Seller message */}

      {user && product.seller && (
        <Chat
          user={user}
          seller={product.seller}
          buttonClassNames="w-full uppercase"
          product={product}
        />
      )}
    </div>
  )
}
