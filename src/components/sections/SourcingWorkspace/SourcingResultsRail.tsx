'use client'

import React, { useEffect, useState } from 'react'

import { safeExternalHref } from '@/lib/helpers/url'
import { SendInquiryButton } from '@/components/sections/SourcingInquiries/SendInquiryButton'

import { SourcingCanvas, type CanvasDoc } from './SourcingCanvas'

export type Citation = { title?: string; url?: string }

export type Supplier = {
  name: string
  website?: string | null
  region?: string | null
  summary?: string
  why_relevant?: string
  offerings?: string[]
  certifications?: string[]
  citations?: Citation[]
}

export type CatalogPick = {
  handle: string
  reason?: string
  title?: string
  id?: string
  thumbnail?: string | null
  category?: string | null
  metadata?: Record<string, unknown>
  price?: number | null
  currency?: string | null
  match_reasons?: string[]
}

export type RailResults = {
  catalog_picks: CatalogPick[]
  suppliers: Supplier[]
}

function MetaRow ({ metadata }: { metadata?: Record<string, unknown> }) {
  if (!metadata) return null
  const fields: [string, string][] = []
  const push = (k: string, label: string) => {
    const v = metadata[k]
    if (v !== undefined && v !== null && v !== '') fields.push([label, String(v)])
  }
  push('unit', 'Unit')
  push('moq', 'MOQ')
  push('origin', 'Origin')
  push('lead_time_days', 'Lead time (days)')
  push('certifications', 'Certifications')
  if (!fields.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {fields.map(([label, value]) => (
        <span
          key={label}
          className="text-[11px] rounded-full bg-tese-surface px-2 py-0.5 text-secondary border"
        >
          <span className="text-tese-ice font-medium">{label}:</span> {value}
        </span>
      ))}
    </div>
  )
}

export function CatalogCard ({
  pick,
  locale,
  requirement,
  sourcingThreadId,
}: {
  pick: CatalogPick
  locale: string
  requirement: string
  sourcingThreadId?: string | null
}) {
  const price =
    pick.price != null
      ? new Intl.NumberFormat('en', {
        style: 'currency',
        currency: (pick.currency || 'EUR').toUpperCase(),
        maximumFractionDigits: 0,
      }).format(pick.price)
      : null
  return (
    <div className="tese-sourcing-rail-card">
      <a
        href={`/${locale}/products/${pick.handle}`}
        className="tese-sourcing-rail-thumb"
      >
        {pick.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pick.thumbnail}
            alt={pick.title || pick.handle}
            className="w-full h-full object-cover"
          />
        ) : null}
      </a>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <a
            href={`/${locale}/products/${pick.handle}`}
            className="font-semibold text-primary truncate hover:underline text-[13px]"
          >
            {pick.title}
          </a>
          {price && (
            <span className="text-xs font-semibold text-tese-ice shrink-0">{price}</span>
          )}
        </div>
        {!!pick.match_reasons?.length && (
          <div className="mt-1 flex flex-wrap gap-1">
            {pick.match_reasons.slice(0, 2).map((m) => (
              <span
                key={m}
                className="text-[10px] rounded-full bg-tese-lime-soft text-tese-ink px-1.5 py-0.5"
              >
                {m}
              </span>
            ))}
          </div>
        )}
        {pick.reason && (
          <p className="text-[12px] text-secondary mt-1 line-clamp-2">{pick.reason}</p>
        )}
        <MetaRow metadata={pick.metadata} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={`/${locale}/products/${pick.handle}`}
            className="inline-flex text-[11px] font-medium text-secondary hover:text-primary"
          >
            View →
          </a>
          <SendInquiryButton
            requirement={requirement || pick.reason || `Inquiry for ${pick.title}`}
            title={pick.title}
            target={{
              productHandle: pick.handle,
              productId: pick.id,
              productTitle: pick.title,
            }}
            sourcingThreadId={sourcingThreadId}
          />
        </div>
      </div>
    </div>
  )
}

export function SupplierCard ({
  s,
  requirement,
  sourcingThreadId,
}: {
  s: Supplier
  requirement?: string
  sourcingThreadId?: string | null
}) {
  return (
    <div className="tese-sourcing-rail-card is-stack">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-primary text-[13px] truncate">{s.name}</p>
          {s.region && <p className="text-[11px] text-secondary">{s.region}</p>}
        </div>
        <span className="text-[9px] uppercase tracking-wider rounded-full bg-tese-ink text-tese-lime px-1.5 py-0.5 shrink-0">
          Web
        </span>
      </div>
      {s.summary && (
        <p className="text-[12px] text-secondary line-clamp-2">{s.summary}</p>
      )}
      {s.why_relevant && (
        <p className="text-[12px] text-primary">
          <span className="text-tese-ice font-medium">Why: </span>
          {s.why_relevant}
        </p>
      )}
      {!!s.offerings?.length && (
        <div className="flex flex-wrap gap-1">
          {s.offerings.slice(0, 4).map((o, i) => (
            <span key={i} className="text-[10px] rounded-full bg-tese-surface px-1.5 py-0.5 border">
              {o}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {(() => {
          const websiteHref = safeExternalHref(s.website)
          return websiteHref ? (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium text-tese-ice hover:underline"
            >
              Website ↗
            </a>
          ) : null
        })()}
        <SendInquiryButton
          requirement={requirement || s.why_relevant || `Inquiry for ${s.name}`}
          title={`Inquiry: ${s.name}`}
          target={{ sellerName: s.name }}
          sourcingThreadId={sourcingThreadId}
        />
      </div>
    </div>
  )
}

type SourcingResultsRailProps = {
  results: RailResults | null
  canvasDoc: CanvasDoc | null
  onCanvasChange: (doc: CanvasDoc) => void
  onCanvasClose: () => void
  locale: string
  requirement: string
  sourcingThreadId?: string | null
}

export function SourcingResultsRail ({
  results,
  canvasDoc,
  onCanvasChange,
  onCanvasClose,
  locale,
  requirement,
  sourcingThreadId,
}: SourcingResultsRailProps) {
  const catalogCount = results?.catalog_picks?.length || 0
  const supplierCount = results?.suppliers?.length || 0
  const hasFound = catalogCount + supplierCount > 0
  const [tab, setTab] = useState<'found' | 'canvas'>(
    canvasDoc && !hasFound ? 'canvas' : 'found'
  )

  useEffect(() => {
    if (canvasDoc) setTab('canvas')
  }, [canvasDoc?.id])

  useEffect(() => {
    if (hasFound && !canvasDoc) setTab('found')
  }, [hasFound, canvasDoc])

  if (!hasFound && !canvasDoc) return null

  return (
    <aside className="tese-sourcing-rail" aria-label="Sourcing results">
      <div className="tese-sourcing-rail-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'found'}
          className={`tese-sourcing-rail-tab ${tab === 'found' ? 'is-active' : ''}`}
          onClick={() => setTab('found')}
        >
          Found
          {hasFound ? (
            <span className="tese-sourcing-rail-count">{catalogCount + supplierCount}</span>
          ) : null}
        </button>
        {canvasDoc ? (
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'canvas'}
            className={`tese-sourcing-rail-tab ${tab === 'canvas' ? 'is-active' : ''}`}
            onClick={() => setTab('canvas')}
          >
            Canvas
          </button>
        ) : null}
      </div>

      {tab === 'found' ? (
        <div className="tese-sourcing-rail-body">
          {!hasFound ? (
            <p className="tese-sourcing-rail-empty">
              Results will appear here after a search.
            </p>
          ) : (
            <>
              {catalogCount > 0 ? (
                <section className="tese-sourcing-rail-section">
                  <h3 className="tese-sourcing-rail-section-title">
                    <span className="w-1.5 h-1.5 rounded-full bg-tese-lime" />
                    On tese.io ({catalogCount})
                  </h3>
                  <div className="tese-sourcing-rail-list">
                    {results!.catalog_picks.map((p) => (
                      <CatalogCard
                        key={p.handle}
                        pick={p}
                        locale={locale}
                        requirement={requirement}
                        sourcingThreadId={sourcingThreadId}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
              {supplierCount > 0 ? (
                <section className="tese-sourcing-rail-section">
                  <h3 className="tese-sourcing-rail-section-title">
                    <span className="w-1.5 h-1.5 rounded-full bg-tese-ice" />
                    Web ({supplierCount})
                  </h3>
                  <div className="tese-sourcing-rail-list">
                    {results!.suppliers.map((s, i) => (
                      <SupplierCard
                        key={`${s.name}-${i}`}
                        s={s}
                        requirement={requirement}
                        sourcingThreadId={sourcingThreadId}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <div className="tese-sourcing-rail-canvas-slot">
          <SourcingCanvas
            doc={canvasDoc}
            onClose={onCanvasClose}
            onChange={onCanvasChange}
            embedded
          />
        </div>
      )}
    </aside>
  )
}

/** Keep prior rail when refine returns empty lists; replace when new lists arrive. */
export function mergeRailResults (
  prev: RailResults | null,
  next: { catalog_picks?: CatalogPick[] | null; suppliers?: Supplier[] | null }
): RailResults | null {
  const nextCatalog = Array.isArray(next.catalog_picks) ? next.catalog_picks : []
  const nextSuppliers = Array.isArray(next.suppliers) ? next.suppliers : []
  if (!nextCatalog.length && !nextSuppliers.length) {
    return prev
  }
  return {
    catalog_picks: nextCatalog.length ? nextCatalog : (prev?.catalog_picks || []),
    suppliers: nextSuppliers.length ? nextSuppliers : (prev?.suppliers || []),
  }
}

export function latestRailResultsFromMessages (
  msgs: Array<{ role: string; result?: { catalog_picks?: CatalogPick[]; suppliers?: Supplier[] } }>
): RailResults | null {
  let acc: RailResults | null = null
  for (const m of msgs) {
    if (m.role !== 'assistant' || !m.result) continue
    acc = mergeRailResults(acc, m.result)
  }
  return acc
}
