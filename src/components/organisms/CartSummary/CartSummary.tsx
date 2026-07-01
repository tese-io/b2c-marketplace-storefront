'use client';

import { convertToLocale } from '@/lib/helpers/money';

type CartSummaryProps = {
  item_total: number;
  shipping_total: number;
  total: number;
  currency_code: string;
  tax: number;
  discount_total: number;
};

function SummaryRow ({
  label,
  amount,
  currency_code,
  testId,
  muted = false,
}: {
  label: string;
  amount: number;
  currency_code: string;
  testId?: string;
  muted?: boolean;
}) {
  return (
    <div className="tese-cart-summary-row" data-testid={testId}>
      <span className={muted ? 'tese-cart-summary-label' : 'tese-cart-summary-label'}>{label}</span>
      <span className="tese-cart-summary-value">
        {convertToLocale({ amount, currency_code })}
      </span>
    </div>
  );
}

export const CartSummary = ({
  item_total,
  shipping_total,
  total,
  currency_code,
  tax,
  discount_total,
}: CartSummaryProps) => {
  return (
    <div className="tese-cart-summary" data-testid="cart-summary">
      <SummaryRow
        label="Items"
        amount={item_total}
        currency_code={currency_code}
        testId="cart-summary-items"
      />
      <SummaryRow
        label="Delivery"
        amount={shipping_total}
        currency_code={currency_code}
        testId="cart-summary-delivery"
        muted
      />
      <SummaryRow
        label="Tax"
        amount={tax}
        currency_code={currency_code}
        testId="cart-summary-tax"
        muted
      />
      {discount_total > 0 && (
        <SummaryRow
          label="Discount"
          amount={discount_total}
          currency_code={currency_code}
          testId="cart-summary-discount"
        />
      )}
      <div className="tese-cart-summary-total" data-testid="cart-summary-total">
        <span>Total</span>
        <span>{convertToLocale({ amount: total, currency_code })}</span>
      </div>
    </div>
  );
};
