import { Button } from '@/components/atoms'
import { TeseLogoMark } from '@/components/atoms/TeseLogo/TeseLogoMark'
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink'
import OrderDetails from '@/components/organisms/OrderDefails/OrderDetails'
import OrderShipping from '@/components/organisms/OrderDefails/OrderShipping'
import OrderItems from '@/components/organisms/OrderItems/OrderItems'
import { CartSummary } from '@/components/organisms'
import { HttpTypes } from '@medusajs/types'
import { format } from 'date-fns'
import { getTranslations } from 'next-intl/server'

function SuccessIcon () {
  return (
    <div className="tese-order-success-icon" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M6 14.5l5 5L22 8.5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export async function OrderConfirmedSection ({
  order,
}: {
  order: HttpTypes.StoreOrder & { order_set?: { id: string } }
}) {
  const t = await getTranslations("order")
  const orderSetId = order.order_set?.id ?? order.id
  const itemCount = order.items?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0
  const orderDate = order.created_at
    ? format(new Date(order.created_at), 'dd MMM yyyy')
    : null

  return (
    <div className="tese-order-confirmed" data-testid="order-complete-container">
      <section className="tese-order-hero">
        <SuccessIcon />
        <p className="tese-order-eyebrow">{t("confirmed")}</p>
        <h1 className="tese-order-title">{t("thankYou")}</h1>
        <p className="tese-order-lead">
          We sent confirmation to{' '}
          <span className="tese-order-email" data-testid="order-email">
            {order.email}
          </span>
          . Suppliers will review and fulfil based on your delivery selection.
        </p>

        <div className="tese-order-hero-meta">
          <div className="tese-order-meta-chip">
            <span className="tese-order-meta-label">{t("orderHash")}</span>
            <span className="tese-order-meta-value">{order.display_id}</span>
          </div>
          {orderDate && (
            <div className="tese-order-meta-chip">
              <span className="tese-order-meta-label">{t("placed")}</span>
              <span className="tese-order-meta-value">{orderDate}</span>
            </div>
          )}
          <div className="tese-order-meta-chip">
            <span className="tese-order-meta-label">{t("items")}</span>
            <span className="tese-order-meta-value">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </section>

      <div className="tese-order-layout">
        <div className="tese-order-main">
          <div className="tese-order-card">
            <h2 className="tese-order-card-title">{t("orderDetails")}</h2>
            <OrderDetails order={order} />
          </div>

          <div className="tese-order-card">
            <h2 className="tese-order-card-title">{t("itemsOrdered")}</h2>
            <OrderItems order={order} />
          </div>
        </div>

        <aside className="tese-order-aside">
          <div className="tese-order-card tese-order-summary-card">
            <h2 className="tese-order-card-title">{t("summary")}</h2>
            <CartSummary
              item_total={order.item_total ?? 0}
              shipping_total={order.shipping_subtotal ?? order.shipping_total ?? 0}
              total={order.total ?? 0}
              currency_code={order.currency_code}
              tax={order.tax_total ?? 0}
              discount_total={order.discount_total ?? 0}
            />
          </div>

          <div className="tese-order-card">
            <h2 className="tese-order-card-title">{t("deliveryAndPayment")}</h2>
            <OrderShipping order={order} />
          </div>
        </aside>
      </div>

      <div className="tese-order-actions">
        <LocalizedClientLink href={`/user/orders/${orderSetId}`}>
          <Button className="tese-cart-checkout-btn w-full sm:w-auto px-8 py-3">
            View order details
          </Button>
        </LocalizedClientLink>
        <LocalizedClientLink href="/categories" className="tese-order-secondary-link">
          Continue shopping
        </LocalizedClientLink>
        <LocalizedClientLink href="/sourcing" className="tese-order-tertiary-link">
          Need more materials? Try AI sourcing →
        </LocalizedClientLink>
      </div>

      <div className="tese-order-trust">
        <TeseLogoMark size={24} />
        <p>
          Certified suppliers · ESG transparency · Secure B2B checkout on tese.io
        </p>
      </div>
    </div>
  )
}
