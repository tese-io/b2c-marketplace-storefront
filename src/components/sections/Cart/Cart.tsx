'use client';

import { Button } from '@/components/atoms';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { CartEmpty, CartItems, CartSummary } from '@/components/organisms';
import { useCartContext } from '@/components/providers';
import { useTranslations } from 'next-intl'

export const Cart = () => {
  const t = useTranslations("checkout")
  const { cart } = useCartContext();
  const itemCount = cart?.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;

  if (!cart || !cart.items?.length) {
    return (
      <div className="tese-cart-layout tese-cart-layout--empty">
        <CartEmpty />
      </div>
    );
  }

  return (
    <div className="tese-cart-layout">
      <header className="tese-cart-head col-span-full">
        <div>
          <p className="tese-cart-eyebrow">{t("checkout")}</p>
          <h1 className="tese-cart-title">{t("yourCart")}</h1>
          <p className="tese-cart-sub">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} from verified marketplace suppliers
          </p>
        </div>
        <LocalizedClientLink href="/categories" className="tese-cart-continue">
          Continue shopping
        </LocalizedClientLink>
      </header>

      <div className="tese-cart-main">
        <CartItems cart={cart} />
      </div>

      <aside className="tese-cart-aside">
        <div className="tese-cart-summary-card">
          <h2 className="tese-cart-summary-title">{t("orderSummary")}</h2>
          <CartSummary
            item_total={cart?.item_subtotal || 0}
            shipping_total={cart?.shipping_subtotal || 0}
            total={cart?.total || 0}
            currency_code={cart?.currency_code || ''}
            tax={cart?.tax_total || 0}
            discount_total={cart?.discount_subtotal || 0}
          />
          <LocalizedClientLink href="/checkout?step=address" className="block w-full">
            <Button className="tese-cart-checkout-btn flex w-full items-center justify-center py-3.5">
              Go to checkout
            </Button>
          </LocalizedClientLink>
          <p className="tese-cart-summary-note">
            Shipping and taxes may update at checkout based on your delivery address.
          </p>
        </div>
      </aside>
    </div>
  );
};
