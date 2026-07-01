import { paymentInfoMap } from '@/lib/constants'
import { convertToLocale } from '@/lib/helpers/money'
import { HttpTypes } from '@medusajs/types'

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const OrderShipping = ({ order }: ShippingDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  const shippingMethod = order.shipping_methods?.[0]

  return (
    <div className="tese-order-shipping">
      <div className="tese-order-shipping-block">
        <h3 className="tese-order-shipping-label">Shipping address</h3>
        <p>{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p>
        <p>
          {order.shipping_address?.address_1}
          {order.shipping_address?.address_2 ? `, ${order.shipping_address.address_2}` : ''}
        </p>
        <p>
          {order.shipping_address?.postal_code}, {order.shipping_address?.city}
        </p>
        <p>{order.shipping_address?.country_code?.toUpperCase()}</p>
      </div>

      <div className="tese-order-shipping-block" data-testid="shipping-contact-summary">
        <h3 className="tese-order-shipping-label">Contact</h3>
        <p>{order.shipping_address?.phone}</p>
        <p>{order.email}</p>
      </div>

      {shippingMethod && (
        <div className="tese-order-shipping-block" data-testid="shipping-method-summary">
          <h3 className="tese-order-shipping-label">Delivery method</h3>
          <p>
            {shippingMethod.name}{' '}
            ({convertToLocale({
              amount: shippingMethod.total ?? 0,
              currency_code: order.currency_code,
            })})
          </p>
        </div>
      )}

      {payment && (
        <div className="tese-order-shipping-block">
          <h3 className="tese-order-shipping-label">Payment method</h3>
          <p data-testid="payment-method">
            {paymentInfoMap[payment.provider_id]?.title || payment.provider_id}
          </p>
        </div>
      )}
    </div>
  )
}

export default OrderShipping
