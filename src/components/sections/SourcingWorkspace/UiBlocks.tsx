'use client'

import React from 'react'

export type UiBlock = {
  type: string
  entity?: string | null
  title?: string
  columns?: string[]
  rows?: { cells: string[]; highlight?: string | null }[]
  entity_refs?: { name: string; kind?: string; handle?: string | null }[]
  markdown?: string
  items?: string[]
}

export function ComparisonBlock ({ block }: { block: UiBlock }) {
  const columns = block.columns || []
  const rows = block.rows || []
  if (columns.length < 2 || rows.length < 1) return null

  return (
    <div className="tese-sourcing-comparison">
      <div className="tese-sourcing-comparison-head">
        <span className="tese-sourcing-comparison-kicker">
          Comparison{block.entity ? ` · ${block.entity}` : ''}
        </span>
        {block.title ? (
          <h4 className="tese-sourcing-comparison-title">{block.title}</h4>
        ) : null}
      </div>
      <div className="tese-sourcing-comparison-scroll">
        <table className="tese-sourcing-comparison-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {(row.cells || []).map((cell, ci) => (
                  <td key={ci} className={ci === 0 ? 'is-criterion' : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ArtifactCard ({
  block,
  onOpenCanvas,
}: {
  block: UiBlock
  onOpenCanvas?: (block: UiBlock) => void
}) {
  const isChecklist = block.type === 'checklist'
  return (
    <div className="tese-sourcing-artifact-card">
      <div className="tese-sourcing-artifact-head">
        <span className="tese-sourcing-comparison-kicker">
          {isChecklist ? 'Checklist' : 'Document'}
        </span>
        <h4 className="tese-sourcing-comparison-title">{block.title || 'Sourcing artifact'}</h4>
      </div>
      {isChecklist && !!block.items?.length && (
        <ul className="tese-sourcing-artifact-preview">
          {block.items.slice(0, 4).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
          {block.items.length > 4 ? <li>+{block.items.length - 4} more</li> : null}
        </ul>
      )}
      {!isChecklist && block.markdown ? (
        <p className="tese-sourcing-artifact-snippet">
          {block.markdown.slice(0, 160)}
          {block.markdown.length > 160 ? '…' : ''}
        </p>
      ) : null}
      {onOpenCanvas ? (
        <button
          type="button"
          className="tese-sourcing-artifact-open"
          onClick={() => onOpenCanvas(block)}
        >
          Open in canvas
        </button>
      ) : null}
    </div>
  )
}

export function UiBlockRenderer ({
  blocks,
  onOpenCanvas,
}: {
  blocks?: UiBlock[] | null
  onOpenCanvas?: (block: UiBlock) => void
}) {
  if (!blocks?.length) return null
  return (
    <div className="tese-sourcing-ui-blocks">
      {blocks.map((block, i) => {
        if (block.type === 'comparison') {
          return <ComparisonBlock key={i} block={block} />
        }
        if (block.type === 'checklist' || block.type === 'doc') {
          return (
            <ArtifactCard key={i} block={block} onOpenCanvas={onOpenCanvas} />
          )
        }
        return null
      })}
    </div>
  )
}
