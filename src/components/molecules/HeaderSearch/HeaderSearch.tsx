"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { SearchIcon } from "@/icons"
import { cn } from "@/lib/utils"

type HeaderSearchProps = {
  className?: string
  variant?: "default" | "metalbook"
}

export function HeaderSearch({
  className = "",
  variant = "default",
}: HeaderSearchProps) {
  const router = useRouter()
  const { locale } = useParams()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("query") || "")
  const isMetalbook = variant === "metalbook"

  function submit(e?: React.FormEvent) {
    e?.preventDefault()
    const q = search.trim()
    const base = `/${locale}/categories`
    router.push(q ? `${base}?query=${encodeURIComponent(q)}` : base)
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        isMetalbook ? "tese-header-search-metalbook" : "tese-header-search",
        className
      )}
      role="search"
    >
      <label htmlFor="header-search" className="sr-only">
        Search catalogue
      </label>
      <SearchIcon size={20} aria-hidden />
      <input
        id="header-search"
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
          placeholder="Search recycled materials, renewables, certified suppliers…"
        className="tese-header-search-input"
        autoComplete="off"
      />
      <button
        type="submit"
        className={isMetalbook ? "tese-header-search-btn-lime" : "tese-header-search-btn"}
      >
        Search
      </button>
    </form>
  )
}
