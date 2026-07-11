'use client'

import { SparkIcon } from '@/icons'

export type FollowUpChip = {
  label: string
  prompt: string
  kind?: 'refine' | 'action' | string
  intent?: 'research' | 'compare' | 'refine' | string | null
}

export function normalizeFollowUps (raw: unknown): FollowUpChip[] {
  if (!Array.isArray(raw)) return []
  const out: FollowUpChip[] = []
  for (const item of raw) {
    if (typeof item === 'string' && item.trim()) {
      const t = item.trim()
      out.push({ label: t, prompt: t, kind: 'refine' })
    } else if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>
      const label = String(obj.label || obj.prompt || '').trim()
      const prompt = String(obj.prompt || label).trim()
      if (!label || !prompt) continue
      out.push({
        label,
        prompt,
        kind: typeof obj.kind === 'string' ? obj.kind : 'refine',
        intent: typeof obj.intent === 'string' ? obj.intent : null,
      })
    }
  }
  return out.slice(0, 6)
}

export function FollowUpChips ({
  items,
  onSelect,
}: {
  items: FollowUpChip[]
  onSelect: (chip: FollowUpChip) => void
}) {
  if (!items.length) return null
  return (
    <div className="tese-sourcing-followups">
      <p className="tese-sourcing-followups-label">Suggested next steps</p>
      <ul className="tese-sourcing-followups-list">
        {items.map((f, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSelect(f)}
              className={
                f.kind === 'action'
                  ? 'tese-sourcing-followups-item is-action'
                  : 'tese-sourcing-followups-item'
              }
            >
              <span className="tese-sourcing-followups-wand" aria-hidden>
                <SparkIcon size={14} color="rgb(var(--neutral-400))" />
              </span>
              {f.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
