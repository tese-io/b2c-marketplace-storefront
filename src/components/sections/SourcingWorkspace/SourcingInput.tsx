'use client'

import { useEffect, useRef, useState } from 'react'

import { ArrowRightIcon, SparkIcon } from '@/icons'
import { TeseLogoMark } from '@/components/atoms/TeseLogo/TeseLogoMark'

import { AI_MODELS, DEFAULT_AI_MODEL, QUICK_PROMPTS, type AiModelId } from './constants'

function ChevronDownIcon ({ size = 12, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AttachIcon ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.5 6.5V15.25a4.25 4.25 0 1 1-8.5 0V5.75a2.75 2.75 0 1 1 5.5 0v9.5a1.25 1.25 0 1 1-2.5 0V6.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SkillsIcon ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.75" y="3.75" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5" />
      <rect x="13.25" y="3.75" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5" />
      <rect x="3.75" y="13.25" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5" />
      <rect x="13.25" y="13.25" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function MicIcon ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="3.5" width="6" height="11" rx="3" stroke={color} strokeWidth="1.5" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 16.5v3.5M9 20.5h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SourcingInputProps = {
  input: string
  setInput: (v: string | ((prev: string) => string)) => void
  loading: boolean
  onSubmit: (q: string) => void
  centered?: boolean
  inputId?: string
}

export function SourcingInput ({
  input,
  setInput,
  loading,
  onSubmit,
  centered = false,
  inputId = 'sourcing-input',
}: SourcingInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<AiModelId>(DEFAULT_AI_MODEL)
  const [attachmentName, setAttachmentName] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const activeModel = AI_MODELS.find((m) => m.id === selectedModel) ?? AI_MODELS[0]
  const hasText = input.trim().length > 0
  const canSend = hasText && !loading
  const [speechSupported, setSpeechSupported] = useState(false)

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: unknown
      webkitSpeechRecognition?: unknown
    }
    setSpeechSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition))
    return () => {
      try {
        recognitionRef.current?.stop()
      } catch {
        // ignore
      }
    }
  }, [])

  function toggleVoice () {
    if (loading) return
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Ctor) return

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }

    const recognition = new Ctor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      if (transcript) {
        setInput((prev) => (prev.trim() ? `${prev.trim()} ${transcript}` : transcript))
      }
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      setListening(false)
    }
  }

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [input])

  useEffect(() => {
    if (!menuOpen && !modelOpen) return
    function handlePointerDown (e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setModelOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [menuOpen, modelOpen])

  function handleSubmit (e?: React.FormEvent) {
    e?.preventDefault()
    if (!canSend) return
    let query = input.trim()
    if (attachmentName) {
      query = `${query}\n\n[Attachment: ${attachmentName}]`
      setAttachmentName(null)
    }
    onSubmit(query)
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    })
  }

  function pickSkill (query: string) {
    setInput(query)
    setMenuOpen(false)
    textareaRef.current?.focus()
  }

  function handleFileChange (e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setAttachmentName(file.name)
    e.target.value = ''
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`tese-sourcing-input-form ${centered ? 'is-centered' : ''}`}
    >
      <label htmlFor={inputId} className="sr-only">
        Describe your sourcing requirement
      </label>

      <div className="tese-sourcing-input-wrap" ref={menuRef}>
        {menuOpen && (
          <div className="tese-sourcing-skills-menu" role="dialog" aria-label="Sourcing skills">
            <div className="tese-sourcing-skills-head">
              <span className="tese-sourcing-skills-title">Skills</span>
              <button
                type="button"
                className="tese-sourcing-skills-close"
                onClick={() => setMenuOpen(false)}
                aria-label="Close skills"
              >
                ×
              </button>
            </div>
            <ul className="tese-sourcing-skills-list">
              {QUICK_PROMPTS.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className="tese-sourcing-skills-item"
                    onClick={() => pickSkill(item.query)}
                  >
                    <span className="tese-sourcing-skills-icon" aria-hidden>
                      <SparkIcon size={14} color="rgb(var(--tese-forest))" />
                    </span>
                    <span className="tese-sourcing-skills-copy">
                      <span className="tese-sourcing-skills-name">{item.label}</span>
                      <span className="tese-sourcing-skills-desc">{item.query}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="tese-sourcing-input-card">
          {attachmentName && (
            <div className="tese-sourcing-attachment-chip">
              <AttachIcon size={14} />
              <span>{attachmentName}</span>
              <button
                type="button"
                onClick={() => setAttachmentName(null)}
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          )}

          <textarea
            id={inputId}
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            rows={centered ? 2 : 1}
            placeholder="Describe your needs…"
            disabled={loading}
            className="tese-sourcing-textarea"
          />

          <div className="tese-sourcing-input-toolbar">
            <div className="tese-sourcing-input-actions">
              <input
                ref={fileRef}
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                onChange={handleFileChange}
                tabIndex={-1}
              />
              <button
                type="button"
                className="tese-sourcing-input-icon-btn"
                disabled={loading}
                aria-label="Attach file"
                title="Attach file"
                onClick={() => fileRef.current?.click()}
              >
                <AttachIcon />
              </button>
              <button
                type="button"
                className={`tese-sourcing-input-icon-btn ${menuOpen ? 'is-active' : ''}`}
                disabled={loading}
                aria-label="Browse skills"
                aria-expanded={menuOpen}
                title="Skills"
                onClick={() => {
                  setMenuOpen((open) => !open)
                  setModelOpen(false)
                }}
              >
                <SkillsIcon />
              </button>
              {speechSupported ? (
                <button
                  type="button"
                  className={`tese-sourcing-input-icon-btn ${listening ? 'is-listening' : ''}`}
                  disabled={loading}
                  aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                  aria-pressed={listening}
                  title={listening ? 'Listening…' : 'Voice input'}
                  onClick={toggleVoice}
                >
                  <MicIcon />
                </button>
              ) : null}
            </div>

            <div className="tese-sourcing-input-actions tese-sourcing-model-wrap">
              {modelOpen && (
                <div
                  className="tese-sourcing-model-menu"
                  role="listbox"
                  aria-label="Select AI model"
                >
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      role="option"
                      aria-selected={model.id === selectedModel}
                      disabled={!model.available}
                      className={`tese-sourcing-model-option ${model.id === selectedModel ? 'is-selected' : ''}`}
                      onClick={() => {
                        if (!model.available) return
                        setSelectedModel(model.id)
                        setModelOpen(false)
                      }}
                    >
                      <span className="tese-sourcing-model-option-icon" aria-hidden>
                        <TeseLogoMark size={14} className="h-3.5 w-3.5" />
                      </span>
                      <span className="tese-sourcing-model-option-copy">
                        <span className="tese-sourcing-model-option-label">{model.label}</span>
                        <span className="tese-sourcing-model-option-desc">{model.description}</span>
                      </span>
                      {model.id === selectedModel && (
                        <span className="tese-sourcing-model-option-check" aria-hidden>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className={`tese-sourcing-model-select ${modelOpen ? 'is-open' : ''}`}
                aria-label="Select AI model"
                aria-haspopup="listbox"
                aria-expanded={modelOpen}
                disabled={loading}
                onClick={() => {
                  setModelOpen((open) => !open)
                  setMenuOpen(false)
                }}
              >
                <TeseLogoMark size={12} className="h-3 w-3" />
                <span>{activeModel.label}</span>
                <ChevronDownIcon />
              </button>
              <button
                type="submit"
                disabled={!canSend}
                className={`tese-sourcing-send-btn ${canSend ? 'is-ready' : ''}`}
                aria-label={loading ? 'Sourcing in progress' : 'Submit sourcing query'}
              >
                {loading ? (
                  <span className="tese-sourcing-send-spinner" aria-hidden />
                ) : (
                  <ArrowRightIcon
                    color={canSend ? '#fff' : 'rgb(var(--neutral-400))'}
                    size={18}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
