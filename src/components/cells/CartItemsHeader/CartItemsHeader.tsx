import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { SingleProductSeller } from '@/types/product';
import { format } from 'date-fns';

import { SellerAvatar } from '../SellerAvatar/SellerAvatar';

export const CartItemsHeader = ({
  seller,
}: {
  seller: SingleProductSeller;
}) => {
  const joined =
    seller.id !== 'marketplace' && seller.created_at
      ? format(seller.created_at, 'MMM yyyy')
      : null;

  const inner = (
    <div className="tese-cart-seller-head">
      <SellerAvatar photo={seller.photo} size={36} alt={seller.name} />
      <div className="min-w-0">
        <p className="tese-cart-seller-name">{seller.name}</p>
        {joined && (
          <p className="tese-cart-seller-meta">Supplier since {joined}</p>
        )}
      </div>
    </div>
  );

  if (seller.handle) {
    return (
      <LocalizedClientLink href={`/sellers/${seller.handle}`} className="block">
        {inner}
      </LocalizedClientLink>
    );
  }

  return inner;
};
