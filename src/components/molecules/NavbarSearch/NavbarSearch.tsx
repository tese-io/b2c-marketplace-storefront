"use client"

import { Input } from "@/components/atoms"
import { SearchIcon, SparkIcon } from "@/icons"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { redirect } from "next/navigation"
import clsx from "clsx"

interface Props {
  className?: string
}

export const NavbarSearch = ({ className }: Props) => {
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("query") || "")

  const handleSearch = () => {
    if (search) {
      redirect(`/categories?query=${search}&ai_search=true`)
    } else {
      redirect(`/categories`)
    }
  }

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <form className={clsx("w-full px-16 relative", className)} method="POST" onSubmit={submitHandler}>
      <div className="relative flex items-center w-full">
        <Input
          icon={<SearchIcon />}
          onIconClick={handleSearch}
          iconAriaLabel="Search"
          placeholder="Try: 'sustainable cotton t-shirts under $50'"
          value={search}
          changeValue={setSearch}
          type="search"
          className="pr-24 !rounded-full !py-2.5"
        />
        {/* AI Badge */}
        <div className="absolute right-3 flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-sm" style={{ top: '50%', transform: 'translateY(-50%)' }}>
          <SparkIcon size={14} color="white" className="animate-pulse" />
          <span>AI Search</span>
        </div>
      </div>
      <input type="submit" className="hidden" />
    </form>
  )
}
