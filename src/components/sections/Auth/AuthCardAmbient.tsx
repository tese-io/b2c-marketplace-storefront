'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

type AuthCardAmbientProps = {
  children: ReactNode
}

const CENTER = { x: 0.5, y: 0.5 }

export function AuthCardAmbient ({ children }: AuthCardAmbientProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [pointer, setPointer] = useState(CENTER)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const onMove = (event: MouseEvent) => {
      if (motionQuery.matches) return

      const stage = stageRef.current
      if (!stage) return

      const rect = stage.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height

      setPointer({
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const stageStyle = {
    '--auth-pointer-x': pointer.x,
    '--auth-pointer-y': pointer.y,
    '--auth-shift-x': pointer.x - 0.5,
    '--auth-shift-y': pointer.y - 0.5,
  } as CSSProperties

  return (
    <div ref={stageRef} className="tese-auth-stage" style={stageStyle}>
      <div className="tese-auth-ambient" aria-hidden>
        <span className="tese-auth-blob-track tese-auth-blob-track--lime">
          <span className="tese-auth-blob tese-auth-blob--lime" />
        </span>
        <span className="tese-auth-blob-track tese-auth-blob-track--ice">
          <span className="tese-auth-blob tese-auth-blob--ice" />
        </span>
        <span className="tese-auth-blob-track tese-auth-blob-track--mint">
          <span className="tese-auth-blob tese-auth-blob--mint" />
        </span>
      </div>

      {children}
    </div>
  )
}
