'use client'

import { Button } from '@/components/atoms'
import { ProductVariants } from '@/components/molecules'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import { WishlistButton } from '@/components/cells/WishlistButton/WishlistButton'
import { Chat } from '@/components/organisms/Chat/Chat'
import { RequestQuoteButton } from '@/components/organisms/B2BProductPurchasePanel/RequestQuoteButton'
import { useCartContext } from '@/components/providers'
import useGetAllSearchParams from '@/hooks/useGetAllSearchParams'
import { getProductPrice } from '@/lib/helpers/get-product-price'
import { getProcurementSpecs } from '@/lib/helpers/product-procurement'
import { toast } from '@/lib/helpers/toast'
import { SellerProps } from '@/types/seller'
import { Wishlist } from '@/types/wishlist'
import { HttpTypes } from '@medusajs/types'

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant['options']
) =>
  variantOptions?.reduce(
    (acc: Record<string, string>, varopt: HttpTypes.StoreProductOptionValue) => {
      acc[varopt.option?.title.toLowerCase() || ''] = varopt.value
      return acc
    },
    {}
  )

export function B2BProductPurchasePanel({
  product,
  locale,
  user,
  wishlist,
  sectorLabels,
  hideHeader = false,
  catalogTitle,
}: {
  product: HttpTypes.StoreProduct & { seller?: SellerProps }
  locale: string
  user: HttpTypes.StoreCustomer | null
  wishlist?: Wishlist
  sectorLabels?: string[]
  hideHeader?: boolean
  catalogTitle?: string
}) {
  const { addToCart, onAddToCart, cart, isAddingItem } = useCartContext()
  const { allSearchParams } = useGetAllSearchParams()

  const { cheapestVariant, cheapestPrice } = getProductPrice({ product })
  const hasAnyPrice = cheapestPrice !== null && cheapestVariant !== null
  const specs = getProcurementSpecs(product)
  const category = product.categories?.[0]

  const selectedVariant = hasAnyPrice
    ? { ...optionsAsKeymap(cheapestVariant.options ?? null), ...allSearchParams }
    : allSearchParams

  const variantId =
    product.variants?.find(({ options }: { options: HttpTypes.StoreProductOptionValue[] | null }) =>
      options?.every((option) =>
        selectedVariant[option.option?.title.toLowerCase() || '']?.includes(option.value)
      )
    )?.id || ''

  const { variantPrice } = getProductPrice({ product, variantId })

  const variantStock =
    product.variants?.find(({ id }) => id === variantId)?.inventory_quantity || 0

  const variantHasPrice = !!product.variants?.find(({ id }) => id === variantId)
    ?.calculated_price

  const isVariantStockMaxLimitReached =
    (cart?.items?.find((item) => item.variant_id === variantId)?.quantity ?? 0) >=
    variantStock

  const handleAddToCart = async () => {
    if (!variantId || !hasAnyPrice || isVariantStockMaxLimitReached) return

    const subtotal = +(variantPrice?.calculated_price_without_tax_number || 0)
    const total = +(variantPrice?.calculated_price_number || 0)

    onAddToCart(
      {
        thumbnail: product.thumbnail || '',
        product_title: product.title,
        quantity: 1,
        subtotal,
        total,
        tax_total: total - subtotal,
        variant_id: variantId,
        product_id: product.id,
        variant: product.variants?.find(({ id }) => id === variantId),
      },
      variantPrice?.currency_code || 'eur'
    )

    try {
      await addToCart({ variantId, quantity: 1, countryCode: locale })
    } catch {
      toast.error({
        title: 'Error adding to cart',
        description: 'Some variant does not have the required inventory',
      })
    }
  }

  const isAddToCartDisabled =
    !variantStock || !variantHasPrice || !hasAnyPrice || isVariantStockMaxLimitReached

  const quoteQuery = encodeURIComponent(
    `Quote request: ${catalogTitle || product.title}${product.subtitle ? ` — ${product.subtitle}` : ''}${product.seller?.name ? ` (${product.seller.name})` : ''}`
  )

  return (
    <div className={hideHeader ? '' : 'tese-pdp-panel'} data-testid="product-details-header">
      {!hideHeader && (
        <div className="tese-pdp-panel-top">
          <div className="min-w-0 flex-1">
            {category?.name && (
              <p className="tese-pdp-category">{category.name}</p>
            )}
            <h1 className="tese-pdp-title" data-testid="product-title">
              {product.title}
            </h1>
            {product.subtitle && (
              <p className="tese-pdp-subtitle">{product.subtitle}</p>
            )}
            {sectorLabels && sectorLabels.length > 0 && (
              <div className="tese-pdp-sector-tags">
                {sectorLabels.map((label) => (
                  <span key={label} className="tese-pdp-sector-tag">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
          <WishlistButton productId={product.id} wishlist={wishlist} user={user} />
        </div>
      )}

      {hideHeader && (
        <div className="tese-catalog-pdp-listing-actions-top">
          <WishlistButton productId={product.id} wishlist={wishlist} user={user} />
        </div>
      )}

      {hasAnyPrice && variantPrice && (
        <p className="tese-pdp-price" data-testid="product-price-current">
          {variantPrice.calculated_price}
          {getProductMetadataUnit(product) && (
            <span className="tese-pdp-price-unit"> / {getProductMetadataUnit(product)}</span>
          )}
        </p>
      )}

      {!hideHeader && specs.length > 0 && (
        <div className="tese-pdp-spec-table" data-testid="product-spec-table">
          <table>
            <tbody>
              {specs.map((spec) => (
                <tr key={spec.label}>
                  <th scope="row">{spec.label}</th>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasAnyPrice && (
        <ProductVariants product={product} selectedVariant={selectedVariant} />
      )}

      <div className="tese-pdp-actions">
        <RequestQuoteButton
          productTitle={catalogTitle || product.title || 'this product'}
          productHandle={product.handle}
          productId={product.id}
          sellerId={product.seller?.id}
          sellerName={product.seller?.name}
          sellerEmail={product.seller?.email}
          isLoggedIn={Boolean(user)}
        />
        <Button
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          loading={isAddingItem}
          variant="tonal"
          className="tese-pdp-btn-secondary"
          size="large"
          data-testid="product-add-to-cart-button"
        >
          {!hasAnyPrice
            ? 'Not available in region'
            : variantStock && variantHasPrice
              ? 'Add to cart'
              : 'Out of stock'}
        </Button>
      </div>

      <div className="tese-pdp-secondary-links">
        <p className="tese-pdp-secondary-label">Not what you need?</p>
        <ul className="tese-pdp-secondary-list">
          <li>
            <LocalizedClientLink
              href={`/sourcing?q=${quoteQuery}`}
              className="tese-pdp-explore-link"
            >
              Find alternatives with AI sourcing
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </LocalizedClientLink>
          </li>
          {category?.handle && (
            <li>
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                className="tese-pdp-explore-link"
              >
                Browse more in {category.name}
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </LocalizedClientLink>
            </li>
          )}
        </ul>
      </div>

      {user && product.seller && (
        <div className="tese-pdp-chat-wrap">
          <Chat
            user={user}
            seller={product.seller}
            buttonClassNames="w-full"
            product={product}
          />
        </div>
      )}
    </div>
  )
}

function getProductMetadataUnit(product: HttpTypes.StoreProduct) {
  const unit = (product.metadata as Record<string, unknown> | undefined)?.unit
  return unit ? String(unit) : null
}
