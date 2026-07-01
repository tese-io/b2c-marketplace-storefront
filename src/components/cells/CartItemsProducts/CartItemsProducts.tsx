import { HttpTypes } from '@medusajs/types';
import Image from 'next/image';

import { DeleteCartItemButton } from '@/components/molecules';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { UpdateCartItemButton } from '@/components/molecules/UpdateCartItemButton/UpdateCartItemButton';
import { filterValidCartItems } from '@/lib/helpers/filter-valid-cart-items';
import { convertToLocale } from '@/lib/helpers/money';

export const CartItemsProducts = ({
  products,
  currency_code,
  delete_item = true,
  change_quantity = true,
}: {
  products: HttpTypes.StoreCartLineItem[];
  currency_code: string;
  delete_item?: boolean;
  change_quantity?: boolean;
}) => {
  const validProducts = filterValidCartItems(products);

  return (
    <ul className="tese-cart-lines">
      {validProducts.map((product, index) => {
        const { options } = product.variant ?? {};
        const total = convertToLocale({
          amount: product.subtotal ?? 0,
          currency_code,
        });
        const isLast = index === validProducts.length - 1;

        return (
          <li
            key={product.id}
            data-testid={`cart-item-${product.id}`}
            className={`tese-cart-line ${isLast ? '' : 'tese-cart-line--bordered'}`}
          >
            <LocalizedClientLink
              href={`/products/${product.product_handle}`}
              className="tese-cart-line-media"
            >
              {product.thumbnail ? (
                <Image
                  src={decodeURIComponent(product.thumbnail)}
                  alt={product.product_title || 'Product image'}
                  width={96}
                  height={96}
                  className="tese-cart-line-image"
                  data-testid="cart-item-image"
                />
              ) : (
                <Image
                  src="/images/placeholder.svg"
                  alt={product.product_title || 'Product image'}
                  width={48}
                  height={48}
                  className="tese-cart-line-image tese-cart-line-image--placeholder"
                />
              )}
            </LocalizedClientLink>

            <div className="tese-cart-line-body">
              <div className="tese-cart-line-top">
                <LocalizedClientLink href={`/products/${product.product_handle}`}>
                  <h3 className="tese-cart-line-title" data-testid="cart-item-title">
                    {product.product_title}
                    {product.subtitle ? ` · ${product.subtitle}` : ''}
                  </h3>
                </LocalizedClientLink>
                {delete_item && <DeleteCartItemButton id={product.id} />}
              </div>

              <div className="tese-cart-line-details" data-testid="cart-item-details">
                {options?.map(({ option, id, value }) => (
                  <p key={id} className="tese-cart-line-variant">
                    {option?.title}: <span>{value}</span>
                  </p>
                ))}
              </div>

              <div className="tese-cart-line-foot">
                {change_quantity ? (
                  <UpdateCartItemButton
                    quantity={product.quantity}
                    lineItemId={product.id}
                  />
                ) : (
                  <p className="tese-cart-line-qty">Qty {product.quantity}</p>
                )}
                <p className="tese-cart-line-price" data-testid="cart-item-price">
                  {total}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
