import { convertToLocale } from '@/lib/helpers/money';

export const CartItemsFooter = ({
  currency_code,
  price,
}: {
  currency_code: string;
  price: number;
}) => {
  return (
    <div className="tese-cart-seller-delivery">
      <span>Estimated delivery</span>
      <span>
        {convertToLocale({
          amount: price / 1,
          currency_code,
        })}
      </span>
    </div>
  );
};
