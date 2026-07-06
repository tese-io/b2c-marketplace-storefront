'use client';

import { useState } from 'react';

import { HttpTypes } from '@medusajs/types';

import { Button } from '@/components/atoms';
import { MessageIcon } from '@/icons';
import { SellerProps } from '@/types/seller';

import { ChatDrawer } from './ChatDrawer';

export const Chat = ({
  user,
  seller,
  buttonClassNames,
  icon,
  product,
  subject,
  order_id,
  variant = 'tonal',
  buttonSize = 'small'
}: {
  user: HttpTypes.StoreCustomer | null;
  seller: SellerProps;
  buttonClassNames?: string;
  icon?: boolean;
  product?: HttpTypes.StoreProduct;
  subject?: string;
  order_id?: string;
  variant?: 'tonal' | 'filled';
  buttonSize?: 'small' | 'large';
}) => {
  const [modal, setModal] = useState(false);

  if (!user?.id || !seller?.id) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setModal(true)}
        className={buttonClassNames}
        size={buttonSize}
      >
        {icon ? <MessageIcon size={20} /> : 'Write to seller'}
      </Button>
      <ChatDrawer
        open={modal}
        onClose={() => setModal(false)}
        seller_id={seller.id}
        context_id={product?.id || order_id}
        subject={subject || product?.title || null}
      />
    </>
  );
};
