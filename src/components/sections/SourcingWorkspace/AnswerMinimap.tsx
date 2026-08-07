'use client'

import { useEffect, useState } from 'react'

export type MinimapSection = {
  id: string
  label: string
}

type AnswerMinimapProps = {
  sections: MinimapSection[]
  scrollRoot: HTMLElement | null
}

export function AnswerMinimap ({ sections, scrollRoot }: AnswerMinimapProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '')

  useEffect(() => {
    if (!scrollRoot || sections.length < 2) return
    function onScroll () {
      if (!scrollRoot) return
      let current = sections[0]?.id || ''
      for (const section of sections) {
        const el = scrollRoot.querySelector(`#${CSS.escape(section.id)}`)
        if (!el) continue
        const top = (el as HTMLElement).offsetTop - scrollRoot.scrollTop
        if (top <= 120) current = section.id
      }
      setActiveId(current)
    }
    onScroll()
    scrollRoot.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollRoot.removeEventListener('scroll', onScroll)
  }, [scrollRoot, sections])

  if (sections.length < 2) return null

  return (
    <nav className="tese-sourcing-minimap" aria-label="Jump to section">
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          title={section.label}
          aria-label={section.label}
          className={`tese-sourcing-minimap-mark ${activeId === section.id ? 'is-active' : ''}`}
          onClick={() => {
            const el = scrollRoot?.querySelector(`#${CSS.escape(section.id)}`)
            if (el && scrollRoot) {
              scrollRoot.scrollTo({
                top: (el as HTMLElement).offsetTop - 24,
                behavior: 'smooth',
              })
            }
          }}
        />
      ))}
    </nav>
  )
}
