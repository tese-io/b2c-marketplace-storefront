import { HttpTypes } from '@medusajs/types'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = async ({ order }: OrderDetailsProps) => {
  const t = await getTranslations("order")
  return (
    <dl className="tese-order-details-grid">
      <div className="tese-order-detail">
        <dt>{t("orderNumber")}</dt>
        <dd>#{order.display_id}</dd>
      </div>
      <div className="tese-order-detail">
        <dt>{t("orderDate")}</dt>
        <dd>{format(order.created_at, 'dd MMM yyyy')}</dd>
      </div>
      <div className="tese-order-detail">
        <dt>{t("email")}</dt>
        <dd>{order.email}</dd>
      </div>
      {order.currency_code && (
        <div className="tese-order-detail">
          <dt>{t("currency")}</dt>
          <dd>{order.currency_code.toUpperCase()}</dd>
        </div>
      )}
    </dl>
  )
}

export default OrderDetails
