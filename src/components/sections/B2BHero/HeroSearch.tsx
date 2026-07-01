"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function HeroSearch({ locale }: { locale: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function goSearch(q: string) {
    const trimmed = q.trim()
    if (!trimmed) {
      router.push(`/${locale}/sourcing`)
      return
    }
    router.push(`/${locale}/sourcing?q=${encodeURIComponent(trimmed)}`)
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
          placeholder="Describe what you need — grade, qty, certifications, region…"
          className="tese-hero-search-input"
        />
        <button type="submit" className="tese-hero-search-btn cursor-pointer">
          Search
        </button>
      </form>
    </div>
  )
}
