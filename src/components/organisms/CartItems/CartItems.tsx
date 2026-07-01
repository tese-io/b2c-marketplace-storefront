import {
  CartItemsFooter,
  CartItemsHeader,
  CartItemsProducts,
} from '@/components/cells';
import { HttpTypes } from '@medusajs/types';

import { EmptyCart } from './EmptyCart';

export const CartItems = ({ cart }: { cart: HttpTypes.StoreCart | null }) => {
  if (!cart) return null;

  const groupedItems = groupItemsBySeller(cart);

  if (!Object.keys(groupedItems).length) return <EmptyCart />;

  return (
    <div className="tese-cart-sellers">
      {Object.keys(groupedItems).map((key) => (
        <article
          key={key}
          className="tese-cart-seller-card"
          data-testid={`cart-items-seller-${key}`}
        >
          <CartItemsHeader seller={groupedItems[key]?.seller} />
          <CartItemsProducts
            products={groupedItems[key].items || []}
            currency_code={cart.currency_code}
          />
          <CartItemsFooter
            currency_code={cart.currency_code}
            price={cart.shipping_subtotal}
          />
        </article>
      ))}
    </div>
  );
};

function groupItemsBySeller(cart: HttpTypes.StoreCart) {
  const groupedBySeller: Record<
    string,
    { seller: { name: string; id: string; photo?: string; handle?: string; created_at?: Date | string }; items: HttpTypes.StoreCartLineItem[] }
  > = {};

  cart.items?.forEach((item) => {
    const lineItem = item as HttpTypes.StoreCartLineItem & {
      product?: { seller?: { id: string; name: string; photo?: string; handle?: string; created_at?: string } };
    };
    const seller = lineItem.product?.seller;

    if (seller) {
      if (!groupedBySeller[seller.id]) {
        groupedBySeller[seller.id] = { seller, items: [] };
      }
      groupedBySeller[seller.id].items.push(lineItem);
    } else {
      if (!groupedBySeller.marketplace) {
        groupedBySeller.marketplace = {
          seller: {
            name: 'Tese marketplace',
            id: 'marketplace',
            photo: '/logo.png',
            handle: '',
            created_at: new Date(),
          },
          items: [],
        };
      }
      groupedBySeller.marketplace.items.push(lineItem);
    }
  });

  return groupedBySeller;
}
