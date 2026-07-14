"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { TeseLogoMark } from "@/components/atoms/TeseLogo/TeseLogoMark"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import {
  createSourcingThreadId,
  getSourcingThread,
  titleFromQuery,
  upsertSourcingThread,
} from "@/lib/sourcing-history"

import { AI_SOURCING_HOOK, AI_SOURCING_PROMO, AI_SOURCING_TAGLINE } from '@/data/explorer-copy'

import { STAGES, quickPromptsForSector } from "./constants"
import { SourcingInput } from "./SourcingInput"
import { SourcingLegalNotice } from "./SourcingLegalNotice"
import { FollowUpChips, normalizeFollowUps, resolveFollowUpAction, type FollowUpChip } from "./FollowUpChips"
import { UiBlockRenderer, type UiBlock } from "./UiBlocks"
import { AnswerMinimap, type MinimapSection } from "./AnswerMinimap"
import { type CanvasDoc } from "./SourcingCanvas"
import {
  SourcingResultsRail,
  mergeRailResults,
  latestRailResultsFromMessages,
  type CatalogPick,
  type Supplier,
  type RailResults,
} from "./SourcingResultsRail"

type ContextEntity = {
  kind: "supplier" | "product" | string
  name: string
  handle?: string | null
  summary?: string
  why_relevant?: string
  region?: string | null
  offerings?: string[]
  certifications?: string[]
}

type SourcingResult = {
  status: string
  answer: string
  suppliers: Supplier[]
  catalog_picks: CatalogPick[]
  follow_ups: Array<string | FollowUpChip>
  ui_blocks?: UiBlock[]
  intent?: { name?: string; confidence?: number } | null
  meta?: Record<string, unknown>
  thread_id?: string
  personalization?: { company_name: string; sector: string; applied: string[] }
}

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; result?: SourcingResult; pending?: boolean; error?: boolean }

function MarkdownLite({
  text,
  idPrefix,
}: {
  text: string
  idPrefix?: string
}) {
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
  let headingIdx = 0
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
          const sid = idPrefix ? `${idPrefix}-h-${headingIdx++}` : undefined
          return (
            <h3 key={i} id={sid} className="text-lg font-semibold text-primary scroll-mt-6">
              {renderInline(b.replace(/^##\s*/, ""))}
            </h3>
          )
        }
        if (b.startsWith("# ")) {
          const sid = idPrefix ? `${idPrefix}-h-${headingIdx++}` : undefined
          return (
            <h2 key={i} id={sid} className="text-xl font-semibold text-primary scroll-mt-6">
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

function answerMinimapSections(text: string, idPrefix: string): MinimapSection[] {
  const sections: MinimapSection[] = []
  let headingIdx = 0
  for (const block of text.split(/\n{2,}/)) {
    if (block.startsWith("## ") || block.startsWith("# ")) {
      const label = block.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim()
      if (!label) continue
      sections.push({ id: `${idPrefix}-h-${headingIdx++}`, label })
    }
  }
  return sections
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
  onFollowUp,
  messageKey,
  scrollRoot,
  onOpenCanvas,
}: {
  msg: Extract<Message, { role: "assistant" }>
  onFollowUp: (chip: FollowUpChip) => void
  messageKey: string
  scrollRoot: HTMLElement | null
  onOpenCanvas: (block: UiBlock) => void
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
  const followUps = normalizeFollowUps(r.follow_ups)
  const sections = r.answer ? answerMinimapSections(r.answer, messageKey) : []
  const foundCount =
    (r.catalog_picks?.length || 0) + (r.suppliers?.length || 0)
  return (
    <div className="flex flex-col gap-5 relative">
      {r.personalization?.company_name && (
        <div className="rounded-xl border bg-tese-surface px-4 py-3">
          <p className="text-sm font-semibold text-primary">
            Personalised for <span className="text-tese-ice">{r.personalization.company_name}</span>
          </p>
          {!!r.personalization.applied?.length && (
            <details className="mt-1">
              <summary className="cursor-pointer select-none text-[12px] font-medium text-secondary hover:text-primary">
                Your sourcing context
              </summary>
              <ul className="mt-2 flex flex-col gap-1 text-[12px] text-secondary">
                {r.personalization.sector && (
                  <li>
                    <span className="text-tese-ice font-medium">Sector:</span>{" "}
                    {r.personalization.sector}
                  </li>
                )}
                {r.personalization.applied.map((a) => (
                  <li key={a}>{a.replace(/_/g, " ")}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {r.answer && (
        <div className="tese-card p-5 tese-sourcing-answer-wrap">
          <AnswerMinimap sections={sections} scrollRoot={scrollRoot} />
          <MarkdownLite text={r.answer} idPrefix={messageKey} />
          {foundCount > 0 ? (
            <p className="tese-sourcing-results-hint">
              {foundCount} result{foundCount === 1 ? "" : "s"} in the Found panel →
            </p>
          ) : null}
        </div>
      )}

      <UiBlockRenderer blocks={r.ui_blocks} onOpenCanvas={onOpenCanvas} />

      <FollowUpChips items={followUps} onSelect={onFollowUp} />

      {r.status !== "ok" && (
        <p className="text-[12px] text-warning">
          Partial result — some sources were unavailable.
        </p>
      )}
    </div>
  )
}

function latestSector(msgs: Message[]): string | undefined {
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i]
    if (m.role === "assistant" && m.result?.personalization?.sector) {
      return m.result.personalization.sector
    }
  }
  return undefined
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
  const [sector, setSector] = useState<string | undefined>()
  const [canvasDoc, setCanvasDoc] = useState<CanvasDoc | null>(null)
  const [railResults, setRailResults] = useState<RailResults | null>(null)
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastCanvasMsgRef = useRef(-1)
  const bootedRef = useRef(false)
  const pendingIntentHintRef = useRef<string | null>(null)

  const hasConversation = messages.length > 0
  const hasRail = !!(railResults && (railResults.catalog_picks.length || railResults.suppliers.length)) || !!canvasDoc

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!threadParam) {
      setThreadId(null)
      setThreadTitle("")
      setThreadCreatedAt(undefined)
      setMessages([])
      setInput("")
      setSector(undefined)
      setCanvasDoc(null)
      setRailResults(null)
      lastCanvasMsgRef.current = -1
      bootedRef.current = false
      return
    }

    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch(`/api/sourcing/threads/${encodeURIComponent(threadParam)}`, {
          cache: "no-store",
        })
        if (res.ok) {
          const { thread } = await res.json()
          if (!cancelled && thread) {
            setThreadId(thread.id)
            setThreadTitle(thread.title || "")
            setThreadCreatedAt(undefined)
            const loaded: Message[] = (thread.messages || []).map(
              (m: { role: "user" | "assistant"; content: string; result?: Record<string, unknown> }) =>
                m.role === "assistant"
                  ? { role: "assistant", content: m.content || "", result: m.result as SourcingResult | undefined }
                  : { role: "user", content: m.content || "" }
            )
            setMessages(loaded)
            setSector(latestSector(loaded))
            setRailResults(latestRailResultsFromMessages(loaded))
            setInput("")
            bootedRef.current = true
            return
          }
        }
      } catch {
        // fall through to the localStorage-backed thread lookup
      }

      if (cancelled) return
      const thread = getSourcingThread(threadParam)
      if (thread) {
        setThreadId(thread.id)
        setThreadTitle(thread.title)
        setThreadCreatedAt(thread.createdAt)
        setMessages(thread.messages as Message[])
        setSector(latestSector(thread.messages as Message[]))
        setRailResults(latestRailResultsFromMessages(thread.messages as Message[]))
        setInput("")
        bootedRef.current = true
      }
    })()

    return () => {
      cancelled = true
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

  const contextEntities = useMemo(() => {
    const out: ContextEntity[] = []
    const seen = new Set<string>()
    const push = (e: ContextEntity) => {
      const key = String(e.handle || e.name || "").trim().toLowerCase()
      if (!key || seen.has(key)) return
      seen.add(key)
      out.push(e)
    }
    for (let i = messages.length - 1; i >= 0 && out.length < 8; i--) {
      const m = messages[i]
      if (m.role !== "assistant" || !m.result) continue
      for (const s of m.result.suppliers || []) {
        if (!s?.name) continue
        push({
          kind: "supplier",
          name: s.name,
          summary: s.summary || "",
          why_relevant: s.why_relevant || "",
          region: s.region || null,
          offerings: s.offerings || [],
          certifications: s.certifications || [],
        })
      }
      for (const p of m.result.catalog_picks || []) {
        if (!p?.handle) continue
        push({
          kind: "product",
          name: p.title || p.handle,
          handle: p.handle,
          summary: p.reason || "",
          why_relevant: p.reason || "",
        })
      }
    }
    return out
  }, [messages])

  async function runSearch(
    query: string,
    opts?: { intent_hint?: string | null }
  ) {
    const q = query.trim()
    if (!q || loading) return

    const intentHint =
      opts?.intent_hint || pendingIntentHintRef.current || undefined
    pendingIntentHintRef.current = null

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
    const priorEntities = contextEntities
    let serverThreadId: string | undefined

    setMessages((prev) => [
      ...prev,
      { role: "user", content: q },
      { role: "assistant", content: "", pending: true },
    ])

    try {
      const res = await fetch("/api/sourcing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          chat_history: priorHistory,
          context_entities: priorEntities,
          thread_id: activeThreadId ?? undefined,
          intent_hint: intentHint || undefined,
        }),
      })
      const data: SourcingResult = await res.json()
      serverThreadId = data.thread_id
      if (data.personalization?.sector) {
        setSector(data.personalization.sector)
      }
      setRailResults((prev) => mergeRailResults(prev, data))
      if (serverThreadId && serverThreadId !== threadId) {
        setThreadId(serverThreadId)
        // reflect it in the URL without a navigation
        const url = new URL(window.location.href)
        url.searchParams.set("thread", serverThreadId)
        window.history.replaceState(null, "", url.toString())
      }
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
        if (!serverThreadId) {
          persistConversation(activeThreadId!, activeTitle, completed, activeCreatedAt)
        }
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
        if (!serverThreadId) {
          persistConversation(activeThreadId!, activeTitle, failed, activeCreatedAt)
        }
        return failed
      })
    } finally {
      setLoading(false)
    }
  }

  function handleFollowUp (chip: FollowUpChip) {
    const action = resolveFollowUpAction(chip)
    if (action.type === 'compose') {
      pendingIntentHintRef.current = 'refine'
      setInput(action.text)
      requestAnimationFrame(() => {
        const el = document.getElementById('sourcing-input') as HTMLTextAreaElement | null
        if (!el) return
        el.focus()
        const cursor = el.value.length
        el.setSelectionRange(cursor, cursor)
      })
      return
    }
    void runSearch(chip.prompt, {
      intent_hint: chip.intent || undefined,
    })
  }

  function openCanvasFromBlock (block: UiBlock) {
    if (block.type !== 'checklist' && block.type !== 'doc') return
    setCanvasDoc({
      id: `canvas-${Date.now()}`,
      type: block.type,
      title: block.title || (block.type === 'checklist' ? 'Checklist' : 'Document'),
      items: block.items || [],
      markdown: block.markdown || '',
    })
  }

  // Auto-open canvas when a new artifact block arrives
  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.role !== 'assistant' || !m.result?.ui_blocks?.length) continue
      const artifact = m.result.ui_blocks.find(
        (b) => b.type === 'checklist' || b.type === 'doc'
      )
      if (artifact && i > lastCanvasMsgRef.current) {
        lastCanvasMsgRef.current = i
        setCanvasDoc({
          id: `canvas-${i}`,
          type: artifact.type as 'checklist' | 'doc',
          title: artifact.title || (artifact.type === 'checklist' ? 'Checklist' : 'Document'),
          items: artifact.items || [],
          markdown: artifact.markdown || '',
        })
      }
      break
    }
  }, [messages])

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
            <p className="tese-sourcing-home-tagline">{AI_SOURCING_TAGLINE}</p>
            <p className="tese-sourcing-home-hook">{AI_SOURCING_HOOK}</p>
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
            {quickPromptsForSector(sector).map((item) => (
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

          <SourcingLegalNotice />

          <div className="tese-sourcing-promo">
            <p className="tese-sourcing-promo-text">
              <strong>Inquiries &amp; orders</strong> — {AI_SOURCING_PROMO}
            </p>
            <span className="tese-sourcing-promo-arrow" aria-hidden>→</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`tese-sourcing-chat ${hasRail ? 'has-rail' : ''}`}>
      <div className="tese-sourcing-chat-main">
        <div
          ref={(el) => {
            scrollContainerRef.current = el
            setScrollEl((prev) => (prev === el ? prev : el))
          }}
          className="tese-sourcing-chat-scroll"
        >
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
                  onFollowUp={handleFollowUp}
                  messageKey={`msg-${i}`}
                  scrollRoot={scrollEl}
                  onOpenCanvas={openCanvasFromBlock}
                />
              )
            )}
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

      <SourcingResultsRail
        results={railResults}
        canvasDoc={canvasDoc}
        onCanvasChange={setCanvasDoc}
        onCanvasClose={() => setCanvasDoc(null)}
        locale={locale}
        requirement={lastUserQuery}
        sourcingThreadId={threadId}
      />
    </div>
  )
}
