import { HttpTypes } from '@medusajs/types'
import Image from 'next/image'

import { convertToLocale } from '@/lib/helpers/money'

export const Item = ({
  item,
  currencyCode,
}: {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}) => {
  const originalTotal = convertToLocale({
    amount: item.original_total ?? 0,
    currency_code: currencyCode,
  })

  const total = convertToLocale({
    amount: item.total ?? 0,
    currency_code: currencyCode,
  })

  const title =
    (item as HttpTypes.StoreOrderLineItem).product_title ||
    item.title ||
    'Product'

  const subtitle = item.subtitle || item.variant_title

  return (
    <article className="tese-order-line">
      <div className="tese-order-line-media">
        {item.thumbnail ? (
          <Image
            src={decodeURIComponent(item.thumbnail)}
            alt={title}
            width={80}
            height={80}
            className="tese-order-line-image"
          />
        ) : (
          <Image
            src="/images/placeholder.svg"
            alt=""
            width={40}
            height={40}
            className="tese-order-line-image tese-order-line-image--placeholder"
          />
        )}
      </div>

      <div className="tese-order-line-body">
        <h3 className="tese-order-line-title">{title}</h3>
        {subtitle && <p className="tese-order-line-variant">{subtitle}</p>}
        <div className="tese-order-line-foot">
          <span className="tese-order-line-qty">Qty {item.quantity}</span>
          <div className="tese-order-line-prices">
            {total !== originalTotal && (
              <span className="tese-order-line-original">{originalTotal}</span>
            )}
            <span className="tese-order-line-price">{total}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
