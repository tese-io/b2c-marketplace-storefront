import { Suspense } from 'react';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PaymentWrapper from '@/components/organisms/PaymentContainer/PaymentWrapper';
import { CartAddressSection } from '@/components/sections/CartAddressSection/CartAddressSection';
import CartPaymentSection from '@/components/sections/CartPaymentSection/CartPaymentSection';
import CartReview from '@/components/sections/CartReview/CartReview';
import CartShippingMethodsSection from '@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection';
import { CheckoutProgress } from '@/components/sections/CheckoutProgress/CheckoutProgress';
import { retrieveCart } from '@/lib/data/cart';
import { retrieveCustomer } from '@/lib/data/customer';
import { listCartShippingMethods } from '@/lib/data/fulfillment';
import { listCartPaymentMethods } from '@/lib/data/payment';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'My cart page - Checkout'
};

export default async function CheckoutPage({}) {
  return (
    <Suspense
      fallback={
        <div className="tese-checkout-page">
          <div className="tese-container tese-checkout-shell tese-checkout-loading" data-testid="checkout-page-loading">
            Loading checkout…
          </div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

async function CheckoutPageContent({}) {
  const cart = await retrieveCart();

  if (!cart) {
    return notFound();
  }

  const shippingMethods = await listCartShippingMethods(cart.id, false);
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? '');
  const customer = await retrieveCustomer();

  return (
    <PaymentWrapper cart={cart}>
      <main className="tese-checkout-page" data-testid="checkout-page">
        <div className="tese-container tese-checkout-shell">
          <header className="tese-checkout-head">
            <div>
              <p className="tese-checkout-eyebrow">Secure checkout</p>
              <h1 className="tese-checkout-title">Complete your order</h1>
            </div>
          </header>

          <div className="tese-checkout-layout">
            <div className="tese-checkout-main" data-testid="checkout-steps-container">
              <Suspense fallback={null}>
                <CheckoutProgress />
              </Suspense>
              <div className="tese-checkout-steps">
                <CartAddressSection
                  cart={cart}
                  customer={customer}
                />
                <CartShippingMethodsSection
                  cart={cart}
                  availableShippingMethods={shippingMethods as any}
                />
                <CartPaymentSection
                  cart={cart}
                  availablePaymentMethods={paymentMethods}
                />
              </div>
            </div>

            <aside className="tese-checkout-aside" data-testid="checkout-review-container">
              <div className="tese-checkout-review-card">
                <h2 className="tese-checkout-review-title">Order summary</h2>
                <CartReview cart={cart} />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </PaymentWrapper>
  );
}
