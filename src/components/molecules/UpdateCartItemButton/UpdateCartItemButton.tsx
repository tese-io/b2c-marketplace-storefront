'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/atoms';
import { useCartContext } from '@/components/providers';
import { toast } from '@/lib/helpers/toast';
import { useTranslations } from 'next-intl'

export const UpdateCartItemButton = ({
  quantity,
  lineItemId
}: {
  quantity: number;
  lineItemId: string;
}) => {
  const t = useTranslations("product")
  const { updateCartItem, isUpdatingItem } = useCartContext();
  const [pendingQuantity, setPendingQuantity] = useState(quantity);
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);
  const router = useRouter();

  useEffect(() => {
    setPendingQuantity(quantity);
  }, [quantity]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;

    // Update UI immediately (optimistic update)
    setPendingQuantity(newQuantity);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await updateCartItem(lineItemId, newQuantity);
        router.refresh();
      } catch (error: unknown) {
        setPendingQuantity(quantity);
        const errorMessage =
          error instanceof Error
            ? error.message.replace('Error setting up the request: ', '')
            : 'Failed to update quantity';
        toast.error({
          title: 'Error updating cart',
          description: errorMessage
        });
      }
    }, 500);
  };

  const isDecreaseDisabled = pendingQuantity === 1 || isUpdatingItem || !lineItemId;
  const isIncreaseDisabled = isUpdatingItem || !lineItemId;

  return (
    <div className="tese-cart-qty" role="group" aria-label={t("quantity")}>
      <Button
        variant="tonal"
        className="tese-cart-qty-btn"
        disabled={isDecreaseDisabled}
        onClick={() => handleQuantityChange(pendingQuantity - 1)}
        aria-label={t("decreaseQuantity")}
      >
        −
      </Button>
      <span
        className={`tese-cart-qty-value ${
          isDecreaseDisabled || isIncreaseDisabled ? 'is-muted' : ''
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        {pendingQuantity}
      </span>
      <Button
        variant="tonal"
        className="tese-cart-qty-btn"
        disabled={isIncreaseDisabled}
        onClick={() => handleQuantityChange(pendingQuantity + 1)}
        aria-label={t("increaseQuantity")}
      >
        +
      </Button>
    </div>
  );
};
