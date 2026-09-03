"use client"

import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"

export function HeroSearch({ locale }: { locale: string }) {
  const router = useRouter()
  const params = useParams()
  const t = useTranslations("hero")
  const [query, setQuery] = useState("")

  // `locale` is the market; the URL segment carries language too.
  const segment = String(params?.locale ?? locale)

  function goSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) {
      router.push(`/${segment}/sourcing`)
      return
    }
    router.push(`/${segment}/sourcing?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="w-full max-w-2xl">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          goSearch(query)
        }}
        className="tese-hero-search"
      >
        <label htmlFor="hero-search" className="sr-only">
          Describe what you need to source
        </label>
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="tese-hero-search-input"
        />
        <button type="submit" className="tese-hero-search-btn cursor-pointer">
          {t("search")}
        </button>
      </form>
    </div>
  )
}
