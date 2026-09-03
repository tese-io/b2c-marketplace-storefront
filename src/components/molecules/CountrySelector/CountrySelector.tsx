"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"

import { useParams, usePathname, useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import { updateRegionWithValidation } from "@/lib/data/cart"
import { DEFAULT_LANGUAGE, isLanguageOfferedIn } from "@/lib/i18n/config"
import { parseLocale } from "@/lib/i18n/locale"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Label } from "@medusajs/ui"
import { toast } from "@/lib/helpers/toast"

type CountryOption = {
  country: string
  region: string
  label: string
  currency_code: string
}

type CountrySelectProps = {
  regions: HttpTypes.StoreRegion[]
  variant?: "default" | "header"
}

function formatCurrencyCode (code: string) {
  return code.toUpperCase()
}

const CountrySelect = ({ regions, variant = "default" }: CountrySelectProps) => {
  const [current, setCurrent] = useState<CountryOption | undefined>(undefined)

  const t = useTranslations("header")
  const { locale: localeSegment } = useParams()
  const segment = String(localeSegment ?? "")
  const { language, countryCode } = parseLocale(segment)
  const router = useRouter()
  const currentPath = usePathname().split(`/${segment}`)[1]

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        const currency_code = r.currency_code ?? "eur"
        return r.countries?.map((c) => ({
          country: c.iso_2 ?? "",
          region: r.id,
          label: c.display_name ?? c.iso_2 ?? "",
          currency_code,
        }))
      })
      .flat()
      .filter(Boolean)
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? "")) as CountryOption[]
  }, [regions])

  useEffect(() => {
    if (countryCode) {
      const option = options?.find((o) => o.country === countryCode)
      setCurrent(option)
    }
  }, [options, countryCode])

  const handleChange = async (option: CountryOption) => {
    try {
      // Switching market keeps the reader's language where we offer it there,
      // and falls back to the default rather than 404ing on a pair we do not serve.
      const nextLanguage = isLanguageOfferedIn(language, option.country)
        ? language
        : DEFAULT_LANGUAGE

      const result = await updateRegionWithValidation(
        option.country,
        currentPath,
        nextLanguage
      )

      if (result.removedItems.length > 0) {
        const itemsList = result.removedItems.join(", ")
        toast.info({
          title: "Cart updated",
          description: `${itemsList} ${result.removedItems.length === 1 ? "is" : "are"} not available in ${option.label} and ${result.removedItems.length === 1 ? "was" : "were"} removed from your cart.`,
        })
      }

      router.push(result.newPath)
      router.refresh()
    } catch (error: any) {
      toast.error({
        title: "Error switching region",
        description: error?.message || "Failed to update region. Please try again.",
      })
    }
  }

  const isHeader = variant === "header"

  return (
    <div className={cn("relative flex gap-2 items-center justify-end", !isHeader && "md:flex")}>
      {!isHeader && <Label className="label-md hidden md:block">Shipping to</Label>}
      <div>
        <Listbox
          onChange={handleChange}
          defaultValue={
            countryCode
              ? options?.find((o) => o.country === countryCode)
              : undefined
          }
        >
          <ListboxButton
            className={cn(
              "relative flex cursor-default items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-tese-lime/40",
              isHeader
                ? "tese-header-chip min-h-10 gap-1.5 px-2.5"
                : "min-w-[5.5rem] h-10 bg-component-secondary text-left border rounded-lg px-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-gray-300 focus-visible:ring-offset-2 focus-visible:border-gray-300 text-base-regular"
            )}
            aria-label={
              current
                ? `Shipping to ${current.country?.toUpperCase()}, prices in ${formatCurrencyCode(current.currency_code)}`
                : "Shipping region"
            }
          >
            <div className={cn("flex items-center", isHeader ? "gap-1.5 text-sm font-medium" : "txt-compact-small mx-auto")}>
              {current && (
                <span className="flex items-center gap-x-1.5">
                  <ReactCountryFlag
                    alt={`${current.country.toUpperCase()} flag`}
                    svg
                    style={{ width: "16px", height: "16px" }}
                    countryCode={current.country}
                  />
                  {isHeader ? (
                    <span className="hidden sm:inline text-secondary">{t("shipTo")}</span>
                  ) : null}
                  <span>{current.country.toUpperCase()}</span>
                  <span className="text-secondary font-normal" aria-hidden>
                    ·
                  </span>
                  <span className="text-secondary font-normal">
                    {formatCurrencyCode(current.currency_code)}
                  </span>
                </span>
              )}
            </div>
          </ListboxButton>
          <div className={cn("flex relative", isHeader ? "" : "min-w-[5.5rem]")}>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute right-0 z-50 mt-1 max-h-60 min-w-[10rem] overflow-auto rounded-xl border bg-white py-1 text-sm shadow-lg focus:outline-none">
                {options?.map((o) => (
                  <ListboxOption
                    key={`${o.region}-${o.country}`}
                    value={o}
                    className="cursor-pointer select-none px-3 py-2 hover:bg-tese-surface"
                  >
                    <span className="flex items-center justify-between gap-x-3">
                      <span className="flex items-center gap-x-2">
                        <ReactCountryFlag
                          svg
                          style={{ width: "16px", height: "16px" }}
                          countryCode={o.country}
                        />
                        {o.country.toUpperCase()}
                      </span>
                      <span className="text-secondary text-xs">
                        {formatCurrencyCode(o.currency_code)}
                      </span>
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
        </Listbox>
      </div>
    </div>
  )
}

export default CountrySelect
