'use client';

import { useCallback, useEffect, useState } from 'react';

import { RadioGroup } from '@headlessui/react';
import { CheckCircleSolid, CreditCard } from '@medusajs/icons';
import { Container, Heading, Text } from '@medusajs/ui';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/atoms';
import ErrorMessage from '@/components/molecules/ErrorMessage/ErrorMessage';
import { initiatePaymentSession } from '@/lib/data/cart';

import { isStripe as isStripeFunc, paymentInfoMap } from '../../../lib/constants';
import PaymentContainer, {
  StripeCardContainer
} from '../../organisms/PaymentContainer/PaymentContainer';
import { useTranslations } from 'next-intl';

type StoreCardPaymentMethod = any & {
  service_zone?: {
    fulfillment_set: {
      type: string;
    };
  };
};

const CartPaymentSection = ({
  cart,
  availablePaymentMethods
}: {
  cart: any;
  availablePaymentMethods: StoreCardPaymentMethod[] | null;
}) => {
  const t = useTranslations("checkout")
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === 'pending'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ''
  );

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = searchParams.get('step') === 'payment';

  const isStripe = isStripeFunc(selectedPaymentMethod);

  const setPaymentMethod = async (method: string) => {
    setError(null);
    setSelectedPaymentMethod(method);
    if (isStripeFunc(method)) {
      await initiatePaymentSession(cart, {
        provider_id: method
      });
    }
  };

  const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

  const paymentReady = (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handleEdit = () => {
    router.push(pathname + '?' + createQueryString('step', 'payment'), {
      scroll: false
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const shouldInputCard = isStripeFunc(selectedPaymentMethod) && !activeSession;

      const checkActiveSession = activeSession?.provider_id === selectedPaymentMethod;

      if (!checkActiveSession) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod
        });
      }

      if (!shouldInputCard) {
        return router.push(pathname + '?' + createQueryString('step', 'review'), {
          scroll: false
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
  }, [isOpen]);

  const isEditEnabled = !isOpen && !!cart?.payment_collection?.payment_sessions?.length;

  return (
    <section
      className={`tese-checkout-step ${isOpen ? 'tese-checkout-step--open' : 'tese-checkout-step--closed'}`}
      data-testid="checkout-step-payment"
    >
      <div className="tese-checkout-step-head">
        <Heading level="h2" className="tese-checkout-step-title">
          {!isOpen && paymentReady && (
            <CheckCircleSolid className="tese-checkout-step-check" />
          )}
          Payment
        </Heading>
        {isEditEnabled && (
          <Button
            data-testid="checkout-payment-edit-button"
            onClick={handleEdit}
            variant="tonal"
            className="tese-checkout-edit-btn"
          >
            Edit
          </Button>
        )}
      </div>
      <div>
        <div className={isOpen ? 'tese-checkout-step-body' : 'tese-checkout-step-summary'}>
          {isOpen ? (
            <>
              {!paidByGiftcard && availablePaymentMethods?.length && (
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(value: string) => setPaymentMethod(value)}
                  className="tese-checkout-payment-options"
                >
                  {availablePaymentMethods.map(paymentMethod => (
                    <div key={paymentMethod.id}>
                      {isStripeFunc(paymentMethod.id) ? (
                        <StripeCardContainer
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                          paymentInfoMap={paymentInfoMap}
                          setCardBrand={setCardBrand}
                          setError={setError}
                          setCardComplete={setCardComplete}
                        />
                      ) : (
                        <PaymentContainer
                          paymentInfoMap={paymentInfoMap}
                          paymentProviderId={paymentMethod.id}
                          selectedPaymentOptionId={selectedPaymentMethod}
                        />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              )}

              {paidByGiftcard && (
                <div className="tese-checkout-method-card">
                  <Text className="tese-checkout-method-label">Payment method</Text>
                  <Text className="tese-checkout-method-value" data-testid="payment-method-summary">
                    Gift card
                  </Text>
                </div>
              )}

              <ErrorMessage
                error={error}
                data-testid="payment-method-error-message"
              />

              <div className="tese-checkout-step-actions">
                <Button
                  onClick={handleSubmit}
                  className="tese-cart-checkout-btn"
                  variant="filled"
                  loading={isLoading}
                  disabled={(isStripe && !cardComplete) || (!selectedPaymentMethod && !paidByGiftcard)}
                >
                  {!activeSession && isStripeFunc(selectedPaymentMethod)
                    ? 'Enter card details'
                    : 'Continue to review'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {cart && paymentReady && activeSession ? (
                <div className="tese-checkout-payment-summary">
                  <div>
                    <Text className="tese-checkout-method-label">Payment method</Text>
                    <Text className="tese-checkout-method-value" data-testid="payment-method-summary">
                      {paymentInfoMap[activeSession?.provider_id]?.title || activeSession?.provider_id}
                    </Text>
                  </div>
                  <div>
                    <Text className="tese-checkout-method-label">Payment details</Text>
                    <div
                      className="tese-checkout-method-value flex items-center gap-2"
                      data-testid="payment-details-summary"
                    >
                      <Container className="tese-checkout-payment-icon">
                        {paymentInfoMap[selectedPaymentMethod]?.icon || <CreditCard />}
                      </Container>
                      <Text>
                        {isStripeFunc(selectedPaymentMethod) && cardBrand
                          ? cardBrand
                          : 'Another step will appear'}
                      </Text>
                    </div>
                  </div>
                </div>
              ) : paidByGiftcard ? (
                <div className="tese-checkout-method-card">
                  <Text className="tese-checkout-method-label">Payment method</Text>
                  <Text className="tese-checkout-method-value" data-testid="payment-method-summary">
                    Gift card
                  </Text>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default CartPaymentSection;
