import { HttpTypes } from '@medusajs/types'
import { format } from 'date-fns'

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  return (
    <dl className="tese-order-details-grid">
      <div className="tese-order-detail">
        <dt>Order number</dt>
        <dd>#{order.display_id}</dd>
      </div>
      <div className="tese-order-detail">
        <dt>Order date</dt>
        <dd>{format(order.created_at, 'dd MMM yyyy')}</dd>
      </div>
      <div className="tese-order-detail">
        <dt>Email</dt>
        <dd>{order.email}</dd>
      </div>
      {order.currency_code && (
        <div className="tese-order-detail">
          <dt>Currency</dt>
          <dd>{order.currency_code.toUpperCase()}</dd>
        </div>
      )}
    </dl>
  )
}

export default OrderDetails
