'use client';

import { CartSummary } from '@/components/organisms';
import { PromoCode } from '@/components/organisms/PromoCode/PromoCode';

import { CartItems } from './CartItems';
import PaymentButton from './PaymentButton';

const Review = ({ cart }: { cart: any }) => {
  const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard);

  return (
    <div className="tese-checkout-review">
      <div className="tese-checkout-review-items">
        <CartItems cart={cart} />
      </div>

      <div className="tese-checkout-promo">
        <PromoCode cart={cart} />
      </div>

      <div className="tese-checkout-review-totals">
        <CartSummary
          item_total={cart?.item_subtotal || 0}
          shipping_total={cart?.shipping_subtotal || 0}
          total={cart?.total || 0}
          currency_code={cart?.currency_code || ''}
          tax={cart?.tax_total || 0}
          discount_total={cart?.discount_total || 0}
        />
      </div>

      {previousStepsCompleted && (
        <div className="tese-checkout-place-order">
          <PaymentButton
            cart={cart}
            data-testid="submit-order-button"
          />
        </div>
      )}
    </div>
  );
};

export default Review;
