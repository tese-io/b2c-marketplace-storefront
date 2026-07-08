"use client"

import { CheckCircleSolid } from "@medusajs/icons"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useEffect } from "react"

import { Button } from "@/components/atoms"
import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import ShippingAddress from "@/components/organisms/ShippingAddress/ShippingAddress"
import { setAddresses } from "@/lib/data/cart"
import compareAddresses from "@/lib/helpers/compare-addresses"
import Spinner from "@/icons/spinner"

export const CartAddressSection = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isAddress = Boolean(
    cart?.shipping_address &&
      cart?.shipping_address.first_name &&
      cart?.shipping_address.last_name &&
      cart?.shipping_address.address_1 &&
      cart?.shipping_address.city &&
      cart?.shipping_address.postal_code &&
      cart?.shipping_address.country_code
  )
  const isOpen = searchParams.get("step") === "address" || !isAddress

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const [message, formAction] = useActionState(setAddresses, sameAsBilling)

  useEffect(() => {
    if (!isAddress) {
      router.replace(pathname + "?step=address")
    }
  }, [isAddress])

  const handleEdit = () => {
    router.replace(pathname + "?step=address")
  }

  return (
    <section
      className={`tese-checkout-step ${isOpen ? "tese-checkout-step--open" : "tese-checkout-step--closed"}`}
      data-testid="checkout-step-address"
    >
      <div className="tese-checkout-step-head">
        <Heading level="h2" className="tese-checkout-step-title">
          {!isOpen && isAddress && (
            <CheckCircleSolid className="tese-checkout-step-check" />
          )}
          Shipping address
        </Heading>
        {!isOpen && isAddress && (
          <Button
            onClick={handleEdit}
            variant="tonal"
            className="tese-checkout-edit-btn"
            data-testid="checkout-address-edit-button"
          >
            Edit
          </Button>
        )}
      </div>

      <form
        action={async (data) => {
          await formAction(data)
          router.replace(`${pathname}?step=delivery`)
          router.refresh()
        }}
      >
        {isOpen ? (
          <div className="tese-checkout-step-body">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />
            <div className="tese-checkout-step-actions">
              <Button
                className="tese-cart-checkout-btn"
                data-testid="submit-address-button"
                variant="filled"
              >
                Save & continue
              </Button>
            </div>
            <ErrorMessage
              error={message !== "success" && message}
              data-testid="address-error-message"
            />
          </div>
        ) : (
          <div className="tese-checkout-step-summary">
            {cart && cart.shipping_address ? (
              <div className="tese-checkout-address-block">
                <Text className="tese-checkout-address-name">
                  {cart.shipping_address.first_name}{" "}
                  {cart.shipping_address.last_name}
                </Text>
                <Text className="tese-checkout-address-line">
                  {cart.shipping_address.address_1}{" "}
                  {cart.shipping_address.address_2},{" "}
                  {cart.shipping_address.postal_code}{" "}
                  {cart.shipping_address.city},{" "}
                  {cart.shipping_address.country_code?.toUpperCase()}
                </Text>
                <Text className="tese-checkout-address-line">
                  {cart.email}, {cart.shipping_address.phone}
                </Text>
              </div>
            ) : (
              <Spinner />
            )}
          </div>
        )}
        {isAddress && !searchParams.get("step") && (
          <LocalizedClientLink href="/checkout?step=delivery">
            <Button className="tese-cart-checkout-btn mt-4" variant="filled">
              Continue to delivery
            </Button>
          </LocalizedClientLink>
        )}
      </form>
    </section>
  )
}
