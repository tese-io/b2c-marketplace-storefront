import { Button } from '@/components/atoms';
import { TeseLogoMark } from '@/components/atoms/TeseLogo/TeseLogoMark';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';

export function CartEmpty() {
  return (
    <div className="tese-cart-empty col-span-full" data-testid="cart-empty">
      <div className="tese-cart-empty-card">
        <TeseLogoMark size={40} />
        <h2 className="tese-cart-empty-title">Your cart is empty</h2>
        <p className="tese-cart-empty-desc">
          Browse certified materials, renewables, and supplier listings — add items to
          request a quote or check out.
        </p>
        <div className="tese-cart-empty-actions">
          <LocalizedClientLink href="/categories">
            <Button className="tese-cart-checkout-btn w-full py-3">Browse catalogue</Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/sourcing" className="tese-cart-empty-secondary">
            Try AI sourcing →
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  );
}
