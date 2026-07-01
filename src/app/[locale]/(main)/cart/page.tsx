import { Cart } from '@/components/sections';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'My cart page',
};

export default function CartPage({}) {
  return (
    <main className="tese-cart-page">
      <div className="tese-container tese-cart-shell">
        <Suspense fallback={<div className="tese-cart-loading">Loading cart…</div>}>
          <Cart />
        </Suspense>
      </div>
    </main>
  );
}
