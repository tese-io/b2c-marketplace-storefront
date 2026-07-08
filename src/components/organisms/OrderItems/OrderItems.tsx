import { HttpTypes } from '@medusajs/types'

import { Item } from './Item'

type ItemsProps = {
  order: HttpTypes.StoreOrder
}

const OrderItems = ({ order }: ItemsProps) => {
  const items = [...(order.items ?? [])].sort((a, b) => {
    return (a.created_at ?? '') > (b.created_at ?? '') ? -1 : 1
  })

  if (!items.length) {
    return <p className="tese-order-empty-note">No line items on this order.</p>
  }

  return (
    <div className="tese-order-lines">
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          currencyCode={order.currency_code}
        />
      ))}
    </div>
  )
}

export default OrderItems
