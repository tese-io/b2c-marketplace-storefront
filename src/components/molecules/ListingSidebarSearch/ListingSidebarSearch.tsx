'use client'

import { FormEvent, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Input } from '@/components/atoms'
import { SearchIcon } from '@/icons'

type ListingSidebarSearchProps = {
  placeholder?: string
  variant?: 'sidebar' | 'toolbar'
  inputId?: string
}

export function ListingSidebarSearch ({
  placeholder = 'Search listings…',
  variant = 'sidebar',
  inputId = 'listing-sidebar-search',
}: ListingSidebarSearchProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('query') || '')

  useEffect(() => {
    setQuery(searchParams.get('query') || '')
  }, [searchParams])

  function submit (event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const trimmed = query.trim()

    if (trimmed) params.set('query', trimmed)
    else params.delete('query')

    params.delete('page')

    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  function clear () {
    setQuery('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('query')
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const isToolbar = variant === 'toolbar'

  return (
    <form
      className={
        isToolbar
          ? 'tese-listing-toolbar-search'
          : 'tese-listing-sidebar-search'
      }
      method="POST"
      onSubmit={submit}
      role="search"
    >
      <label
        className={
          isToolbar
            ? 'sr-only'
            : 'tese-listing-sidebar-search-label'
        }
        htmlFor={inputId}
      >
        Search
      </label>
      <div
        className={
          isToolbar
            ? 'tese-listing-toolbar-search-row'
            : 'tese-listing-sidebar-search-row'
        }
      >
        <Input
          id={inputId}
          icon={<SearchIcon />}
          onIconClick={submit}
          iconAriaLabel="Search listings"
          placeholder={placeholder}
          value={query}
          changeValue={setQuery}
          type="search"
        />
        {query && !isToolbar && (
          <button
            type="button"
            className="tese-listing-sidebar-search-clear"
            onClick={clear}
          >
            Clear
          </button>
        )}
      </div>
      <input type="submit" className="hidden" />
    </form>
  )
}
