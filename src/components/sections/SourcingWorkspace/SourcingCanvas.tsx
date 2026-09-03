'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export type CanvasDoc = {
  id: string
  type: 'checklist' | 'doc'
  title: string
  markdown?: string
  items?: string[]
}

type SourcingCanvasProps = {
  doc: CanvasDoc | null
  onClose: () => void
  onChange: (doc: CanvasDoc) => void
  embedded?: boolean
}

export function SourcingCanvas ({ doc, onClose, onChange, embedded = false }: SourcingCanvasProps) {
  const t = useTranslations("sourcing")
  if (!doc) return null

  const Tag = embedded ? 'div' : 'aside'

  return (
    <Tag className={`tese-sourcing-canvas ${embedded ? 'is-embedded' : ''}`} aria-label={t("canvas")}>
      <div className="tese-sourcing-canvas-head">
        <div>
          <p className="tese-sourcing-canvas-kicker">
            Canvas · {doc.type === 'checklist' ? 'Checklist' : 'Document'}
          </p>
          <input
            className="tese-sourcing-canvas-title"
            value={doc.title}
            onChange={(e) => onChange({ ...doc, title: e.target.value })}
            aria-label={t("canvasTitle")}
          />
        </div>
        <button
          type="button"
          className="tese-sourcing-canvas-close"
          onClick={onClose}
          aria-label={t("closeCanvas")}
        >
          ×
        </button>
      </div>

      {doc.type === 'checklist' ? (
        <ul className="tese-sourcing-canvas-checklist">
          {(doc.items || []).map((item, i) => (
            <li key={i}>
              <label className="tese-sourcing-canvas-check-item">
                <input type="checkbox" />
                <input
                  className="tese-sourcing-canvas-check-text"
                  value={item}
                  onChange={(e) => {
                    const items = [...(doc.items || [])]
                    items[i] = e.target.value
                    onChange({ ...doc, items })
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <textarea
          className="tese-sourcing-canvas-editor"
          value={doc.markdown || ''}
          onChange={(e) => onChange({ ...doc, markdown: e.target.value })}
          aria-label={t("canvasDocument")}
        />
      )}
    </Tag>
  )
}
