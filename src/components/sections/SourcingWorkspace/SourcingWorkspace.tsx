"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { SparkIcon } from "@/icons"
import { safeExternalHref } from "@/lib/helpers/url"
import { TeseLogoMark } from "@/components/atoms/TeseLogo/TeseLogoMark"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  createSourcingThreadId,
  getSourcingThread,
  titleFromQuery,
  upsertSourcingThread,
} from "@/lib/sourcing-history"

import { SendInquiryButton } from "@/components/sections/SourcingInquiries/SendInquiryButton"

import { QUICK_PROMPTS, STAGES } from "./constants"
import { SourcingInput } from "./SourcingInput"

type Citation = { title?: string; url?: string }

type Supplier = {
  name: string
  website?: string | null
  region?: string | null
  summary?: string
  why_relevant?: string
  offerings?: string[]
  certifications?: string[]
  citations?: Citation[]
}

type CatalogPick = {
  handle: string
  reason?: string
  title?: string
  id?: string
  thumbnail?: string | null
  category?: string | null
  metadata?: Record<string, unknown>
  price?: number | null
  currency?: string | null
}

type SourcingResult = {
  status: string
  answer: string
  suppliers: Supplier[]
  catalog_picks: CatalogPick[]
  follow_ups: string[]
  meta?: Record<string, unknown>
}

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; result?: SourcingResult; pending?: boolean; error?: boolean }

function MarkdownLite({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/)
  const renderInline = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i} className="font-semibold text-primary">
          {p.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{p}</span>
      )
    )
  }
  return (
    <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-secondary">
      {blocks.map((b, i) => {
        const lines = b.split("\n")
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="list-disc pl-5 flex flex-col gap-1">
              {lines.map((l, j) => (
                <li key={j}>{renderInline(l.replace(/^-\s*/, ""))}</li>
              ))}
            </ul>
          )
        }
        if (b.startsWith("## ")) {
          return (
            <h3 key={i} className="text-lg font-semibold text-primary">
              {renderInline(b.replace(/^##\s*/, ""))}
            </h3>
          )
        }
        if (b.startsWith("# ")) {
          return (
            <h2 key={i} className="text-xl font-semibold text-primary">
              {renderInline(b.replace(/^#\s*/, ""))}
            </h2>
          )
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(b)}
          </p>
        )
      })}
    </div>
  )
}

function MetaRow({ metadata }: { metadata?: Record<string, unknown> }) {
  if (!metadata) return null
  const fields: [string, string][] = []
  const push = (k: string, label: string) => {
    const v = metadata[k]
    if (v !== undefined && v !== null && v !== "") fields.push([label, String(v)])
  }
  push("unit", "Unit")
  push("moq", "MOQ")
  push("origin", "Origin")
  push("lead_time_days", "Lead time (days)")
  push("certifications", "Certifications")
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

function CatalogCard({
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
      ? new Intl.NumberFormat("en", {
          style: "currency",
          currency: (pick.currency || "EUR").toUpperCase(),
          maximumFractionDigits: 0,
        }).format(pick.price)
      : null
  return (
    <div className="tese-card p-3 flex gap-3 items-start">
      <a
        href={`/${locale}/products/${pick.handle}`}
        className="w-16 h-16 rounded-md bg-tese-surface overflow-hidden shrink-0"
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
            className="font-semibold text-primary truncate hover:underline"
          >
            {pick.title}
          </a>
          {price && <span className="text-sm font-semibold text-tese-ice shrink-0">{price}</span>}
        </div>
        {pick.category && (
          <span className="text-[11px] uppercase tracking-wide text-secondary">
            {pick.category}
          </span>
        )}
        {pick.reason && <p className="text-[13px] text-secondary mt-1">{pick.reason}</p>}
        <MetaRow metadata={pick.metadata} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={`/${locale}/products/${pick.handle}`}
            className="inline-flex text-[12px] font-medium text-secondary hover:text-primary"
          >
            View product →
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

function SupplierCard({
  s,
  requirement,
  sourcingThreadId,
}: {
  s: Supplier
  requirement?: string
  sourcingThreadId?: string | null
}) {
  return (
    <div className="tese-card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-primary">{s.name}</p>
          {s.region && <p className="text-[12px] text-secondary">{s.region}</p>}
        </div>
        <span className="text-[10px] uppercase tracking-wider rounded-full bg-tese-ink text-tese-lime px-2 py-1">
          Web
        </span>
      </div>
      {s.summary && <p className="text-[13px] text-secondary">{s.summary}</p>}
      {s.why_relevant && (
        <p className="text-[13px] text-primary">
          <span className="text-tese-ice font-medium">Why: </span>
          {s.why_relevant}
        </p>
      )}
      {!!s.offerings?.length && (
        <div className="flex flex-wrap gap-1.5">
          {s.offerings.slice(0, 5).map((o, i) => (
            <span key={i} className="text-[11px] rounded-full bg-tese-surface px-2 py-0.5 border">
              {o}
            </span>
          ))}
        </div>
      )}
      {!!s.certifications?.length && (
        <div className="flex flex-wrap gap-1.5">
          {s.certifications.slice(0, 5).map((c, i) => (
            <span
              key={i}
              className="text-[11px] rounded-full bg-tese-lime-soft text-tese-ink px-2 py-0.5"
            >
              {c}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 mt-1">
        {(() => {
          const websiteHref = safeExternalHref(s.website)
          return websiteHref ? (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-tese-ice hover:underline"
            >
              Visit website ↗
            </a>
          ) : null
        })()}
        <SendInquiryButton
          requirement={requirement || s.why_relevant || `Inquiry for ${s.name}`}
          title={`Inquiry: ${s.name}`}
          target={{
            sellerName: s.name,
          }}
          sourcingThreadId={sourcingThreadId}
        />
        {!!s.citations?.length && (
          <div className="flex flex-wrap gap-2">
            {s.citations.slice(0, 3).map((c, i) => {
              const citationHref = safeExternalHref(c.url)
              return citationHref ? (
                <a
                  key={i}
                  href={citationHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-secondary hover:underline"
                >
                  [{i + 1}] {c.title || "source"}
                </a>
              ) : null
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function PendingBlock() {
  const [stage, setStage] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const s = setInterval(() => setStage((p) => Math.min(p + 1, STAGES.length - 1)), 8000)
    const t = setInterval(() => setElapsed((p) => p + 1), 1000)
    return () => {
      clearInterval(s)
      clearInterval(t)
    }
  }, [])
  return (
    <div className="tese-card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 rounded-full border-2 border-tese-lime border-t-transparent animate-spin" />
        <p className="font-medium text-primary">{STAGES[stage]}</p>
        <span className="ml-auto text-[12px] text-secondary tabular-nums">{elapsed}s</span>
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-3 rounded-full bg-tese-surface overflow-hidden">
            <div className="h-full bg-tese-lime-soft animate-pulse" style={{ width: `${80 - i * 18}%` }} />
          </div>
        ))}
      </div>
      <p className="text-[12px] text-secondary">
        Searching the live web for suppliers — this usually takes 30–60 seconds.
      </p>
    </div>
  )
}

function AssistantBlock({
  msg,
  locale,
  onFollowUp,
  lastUserQuery,
  sourcingThreadId,
}: {
  msg: Extract<Message, { role: "assistant" }>
  locale: string
  onFollowUp: (q: string) => void
  lastUserQuery: string
  sourcingThreadId?: string | null
}) {
  if (msg.pending) return <PendingBlock />
  const r = msg.result
  if (!r) {
    return (
      <div className="tese-card p-5">
        <p className="text-primary">{msg.content}</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-5">
      {r.answer && (
        <div className="tese-card p-5">
          <MarkdownLite text={r.answer} />
        </div>
      )}

      {!!r.catalog_picks?.length && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-secondary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tese-lime" />
            On tese.io ({r.catalog_picks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {r.catalog_picks.map((p) => (
              <CatalogCard
                key={p.handle}
                pick={p}
                locale={locale}
                requirement={lastUserQuery}
                sourcingThreadId={sourcingThreadId}
              />
            ))}
          </div>
        </div>
      )}

      {!!r.suppliers?.length && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-secondary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tese-ice" />
            Discovered on the web ({r.suppliers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {r.suppliers.map((s, i) => (
              <SupplierCard
                key={i}
                s={s}
                requirement={lastUserQuery}
                sourcingThreadId={sourcingThreadId}
              />
            ))}
          </div>
        </div>
      )}

      {!!r.follow_ups?.length && (
        <div className="tese-sourcing-followups">
          <p className="tese-sourcing-followups-label">Click a sample to refine ✨</p>
          <ul className="tese-sourcing-followups-list">
            {r.follow_ups.map((f, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => onFollowUp(f)}
                  className="tese-sourcing-followups-item"
                >
                  <span className="tese-sourcing-followups-wand" aria-hidden>
                    <SparkIcon size={14} color="rgb(var(--neutral-400))" />
                  </span>
                  {f}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.status !== "ok" && (
        <p className="text-[12px] text-warning">
          Partial result — some sources were unavailable.
        </p>
      )}
    </div>
  )
}

function persistConversation (
  id: string,
  title: string,
  msgs: Message[],
  createdAt?: number
) {
  const stored = msgs.filter((m) => !("pending" in m && m.pending))
  if (!stored.length) return
  upsertSourcingThread({
    id,
    title,
    messages: stored,
    updatedAt: Date.now(),
    createdAt: createdAt ?? Date.now(),
  })
}

export function SourcingWorkspace({ locale }: { locale: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const threadParam = searchParams.get("thread")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(threadParam)
  const [threadTitle, setThreadTitle] = useState("")
  const [threadCreatedAt, setThreadCreatedAt] = useState<number | undefined>()
  const endRef = useRef<HTMLDivElement>(null)
  const bootedRef = useRef(false)

  const hasConversation = messages.length > 0

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (threadParam) {
      const thread = getSourcingThread(threadParam)
      if (thread) {
        setThreadId(thread.id)
        setThreadTitle(thread.title)
        setThreadCreatedAt(thread.createdAt)
        setMessages(thread.messages as Message[])
        setInput("")
        bootedRef.current = true
        return
      }
    }

    if (!threadParam) {
      setThreadId(null)
      setThreadTitle("")
      setThreadCreatedAt(undefined)
      setMessages([])
      setInput("")
      bootedRef.current = false
    }
  }, [threadParam])

  const history = useMemo(
    () =>
      messages
        .filter((m) => !("pending" in m && m.pending))
        .map((m) => ({
          role: m.role,
          content: m.role === "assistant" && m.result ? m.result.answer : m.content,
        })),
    [messages]
  )

  async function runSearch(query: string) {
    const q = query.trim()
    if (!q || loading) return

    let activeThreadId = threadId
    let activeTitle = threadTitle
    let activeCreatedAt = threadCreatedAt

    if (!activeThreadId) {
      activeThreadId = createSourcingThreadId()
      activeTitle = titleFromQuery(q)
      activeCreatedAt = Date.now()
      setThreadId(activeThreadId)
      setThreadTitle(activeTitle)
      setThreadCreatedAt(activeCreatedAt)
      router.replace(`?thread=${activeThreadId}`, { scroll: false })
    }

    setLoading(true)
    setInput("")
    const priorHistory = history

    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: "", pending: true },
    ])

    try {
      const res = await fetch("/api/sourcing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, chat_history: priorHistory }),
      })
      const data: SourcingResult = await res.json()
      setMessages((prev) => {
        const base = prev.filter((m) => !("pending" in m && m.pending))
        const completed: Message[] = [
          ...base,
          {
            role: "assistant",
            content: data.answer || "",
            result: data,
          },
        ]
        persistConversation(activeThreadId!, activeTitle, completed, activeCreatedAt)
        return completed
      })
    } catch {
      setMessages((prev) => {
        const base = prev.filter((m) => !("pending" in m && m.pending))
        const failed: Message[] = [
          ...base,
          {
            role: "assistant",
            content: "Something went wrong reaching the sourcing assistant. Please try again.",
            error: true,
          },
        ]
        persistConversation(activeThreadId!, activeTitle, failed, activeCreatedAt)
        return failed
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bootedRef.current) return
    const q = searchParams.get("q")
    const intent = searchParams.get("intent")
    if (q) {
      bootedRef.current = true
      runSearch(q)
    } else if (intent === "finance") {
      bootedRef.current = true
      setInput(
        "I need impact or sustainable finance matched to my procurement — green loans, transition credit, or ESG-linked funding for "
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const lastUserQuery = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i].content
    }
    return ""
  }, [messages])

  if (!hasConversation) {
    return (
      <div className="tese-sourcing-home">
        <div className="tese-sourcing-home-inner">
          <div className="tese-sourcing-home-brand">
            <LocalizedClientLink
              href="/"
              className="tese-sourcing-home-logo"
              aria-label="tese.io home"
            >
              <TeseLogoMark size={56} className="tese-sourcing-home-mark" />
            </LocalizedClientLink>
            <h1 className="tese-sourcing-home-title">AI Sourcing</h1>
            <p className="tese-sourcing-home-tagline">
              All requirements in one ask — match the catalogue and search the web with AI.
            </p>
          </div>

          <SourcingInput
            input={input}
            setInput={setInput}
            loading={loading}
            onSubmit={runSearch}
            centered
            inputId="sourcing-input-home"
          />

          <div className="tese-sourcing-pills" role="group" aria-label="Suggested searches">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={loading}
                onClick={() => runSearch(item.query)}
                className="tese-sourcing-pill"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="tese-sourcing-promo">
            <p className="tese-sourcing-promo-text">
              <strong>Inquiries &amp; orders</strong> — send RFQs to multiple suppliers and track responses from this workspace.
            </p>
            <span className="tese-sourcing-promo-arrow" aria-hidden>→</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tese-sourcing-chat">
      <div className="tese-sourcing-chat-scroll">
        <div className="tese-sourcing-chat-inner">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="tese-sourcing-user-bubble">
                {m.content}
              </div>
            ) : (
              <AssistantBlock
                key={i}
                msg={m}
                locale={locale}
                onFollowUp={runSearch}
                lastUserQuery={lastUserQuery}
                sourcingThreadId={threadId}
              />
            )
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="tese-sourcing-chat-composer">
        <SourcingInput
          input={input}
          setInput={setInput}
          loading={loading}
          onSubmit={runSearch}
        />
      </div>
    </div>
  )
}
