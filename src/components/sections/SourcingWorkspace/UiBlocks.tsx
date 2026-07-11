'use client'

import React from 'react'

export type UiBlock = {
  type: string
  entity?: string | null
  title?: string
  columns?: string[]
  rows?: { cells: string[]; highlight?: string | null }[]
  entity_refs?: { name: string; kind?: string; handle?: string | null }[]
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

export function UiBlockRenderer ({ blocks }: { blocks?: UiBlock[] | null }) {
  if (!blocks?.length) return null
  return (
    <div className="tese-sourcing-ui-blocks">
      {blocks.map((block, i) => {
        if (block.type === 'comparison') {
          return <ComparisonBlock key={i} block={block} />
        }
        // Forward-compatible: ignore unknown Phase 2 types
        return null
      })}
    </div>
  )
}
