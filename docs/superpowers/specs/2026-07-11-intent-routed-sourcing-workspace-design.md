# Intent-Routed AI Sourcing Workspace — design

> Cross-repo feature. Touches: `ai-orchestrator-api` (classifier + compare
> workflow), `b2c-marketplace-storefront` (ui_blocks + chips + Phase 2 shell),
> `tese-backend` (thin proxy passthrough of new fields). Spec lives with other
> storefront sourcing specs; each repo's changes are listed per layer.

## Context

The marketplace **AI Sourcing** chat (`/sourcing`) already returns a structured
JSON brief: markdown `answer`, `catalog_picks`, `suppliers`, string
`follow_ups`, and optional personalization. It is a single Claude+web research
path (`query_processor/workflows/sourcing/engine.py`).

Buyers increasingly behave like ChatGPT/Claude users: they ask to **compare**,
**refine**, and (soon) **produce artifacts**. Today every turn is treated as
generic research. Follow-ups are refine-only strings. There is no comparison
table, canvas, minimap, or voice.

**Goal:** make sourcing behave like an enhanced procurement SME — dynamic,
intent-driven components — without losing the soft-fail, catalog/supplier card
model we already have.

## Decisions (locked)

| Decision | Choice |
|----------|--------|
| Architecture | Approach 3: intent classifier + dedicated workflows |
| Delivery | Phased full vision — one design, staged implementation |
| Dynamic components | Intent-gated only (e.g. compare when user intent is compare) |
| Compare entities | Products **and** suppliers, chosen from context |
| Artifact placement | Hybrid: inline `ui_blocks` in Phase 1; canvas panel in Phase 2 |
| Follow-ups | Typed chips: `refine` + `action` (action may set `intent_hint`) |
| Deferred from earlier MVP framing | Not MVP — full vision designed; Phase 1 ships first |

## Phasing

### Phase 1 — Intent + compare + action chips

1. Intent classifier (`research` | `compare` | `refine`)
2. Dedicated compare workflow over prior picks/suppliers (+ named entities)
3. Typed `follow_ups` with `kind: refine | action`
4. Inline `ComparisonBlock` via `ui_blocks[{ type: "comparison", ... }]`

### Phase 2 — Canvas, minimap, voice

1. `SourcingCanvas` side panel for checklist / RFQ / buying-guide artifacts
2. Answer section minimap for long responses
3. Voice controls on `SourcingInput` (STT + optional voice mode)
4. Additional `ui_blocks` types: `checklist`, `doc` (open into canvas)

## Architecture

```
User message (+ optional intent_hint from action chip)
    │
    ▼
┌─────────────────────┐
│  Intent Classifier  │  research | compare | refine
│                     │  (+ artifact | voice_transcript in Phase 2)
└──────────┬──────────┘
           │
     ┌─────┴──────────┬────────────────┐
     ▼                ▼                ▼
 Research          Compare          Artifact
 workflow          workflow         workflow (Phase 2)
 (today+)          (new)            → canvas ui_blocks
     │                │                │
     └────────┬───────┴────────────────┘
              ▼
     SourcingResponse
       answer, catalog_picks, suppliers
       follow_ups[{ label, prompt, kind }]
       ui_blocks[{ type, ... }]
       intent + meta
              │
              ▼
     Storefront UiBlockRenderer + FollowUpChips
       Phase 1: ComparisonBlock inline
       Phase 2: Canvas + Minimap + Voice
```

Personalization (tenant profile + TenantSelfIntelligence) remains additive on
all workflows, as in `2026-07-07-personalized-ai-sourcing-design.md`.

## Data flow & API

### Request

`POST /api/v1/sourcing/search` (orchestrator), proxied unchanged through
tese-backend and the storefront BFF.

```json
{
  "query": "Compare Mehta GX-II vs Homag for plywood nesting",
  "chat_history": [{ "role": "user", "content": "..." }],
  "candidates": [],
  "tenant_id": "optional",
  "intent_hint": "compare"
}
```

- `intent_hint` is optional. When an action chip is clicked, the storefront
  sets it so classification is unambiguous.
- When `intent_hint` is present and valid, the classifier may short-circuit to
  that intent.

### Response (additive fields)

Existing fields stay. New / changed:

```json
{
  "status": "ok",
  "answer": "...",
  "catalog_picks": [],
  "suppliers": [],
  "follow_ups": [
    { "label": "Compare on price & MOQ", "prompt": "Compare these on price, MOQ, and lead time", "kind": "action", "intent": "compare" },
    { "label": "Narrow to India service", "prompt": "Which of these have strong service coverage in India?", "kind": "refine" }
  ],
  "ui_blocks": [
    {
      "type": "comparison",
      "entity": "supplier",
      "title": "Plywood CNC comparison",
      "columns": ["Criteria", "Mehta GX-II", "Homag"],
      "rows": [
        { "cells": ["Best for", "Value ATC", "Factory line"], "highlight": null },
        { "cells": ["Lead time", "6–10 wk", "12–20 wk"], "highlight": null }
      ],
      "entity_refs": [
        { "name": "Mehta GX-II", "kind": "supplier" },
        { "name": "Homag", "kind": "supplier" }
      ]
    }
  ],
  "intent": { "name": "compare", "confidence": 0.92 },
  "meta": {},
  "personalization": null
}
```

**Backward compatibility:** accept legacy `follow_ups: string[]` in the
storefront for one release (normalize to `{ label, prompt, kind: "refine" }`).
Orchestrator always emits the typed shape going forward.

### Internal orchestration

1. `classify_intent(query, history, intent_hint?)` → `{ intent, confidence, entities[] }`
2. **research | refine** → `run_research()` (current Claude+web path; upgraded
   system prompt for SME tone + typed follow_ups)
3. **compare** → gather entities from history (`catalog_picks`, `suppliers`) and
   names mentioned in the query → `run_compare()` → emit `ui_blocks` comparison
4. Always attach typed `follow_ups` and `intent` meta

### Compare entity rules

- Prefer entities already present in the thread (catalog handles / supplier cards)
- Allow user-named entities not yet carded; mark unverified fields explicitly
- Never invent catalog `handle` values
- If fewer than 2 comparable entities: do **not** emit a comparison block;
  return a research-style brief + an action chip asking which items to compare

## UI components

### Phase 1 (storefront)

| Component | Role |
|-----------|------|
| `UiBlockRenderer` | Switch on `ui_blocks[].type`; ignore unknown types |
| `ComparisonBlock` | Table for `type: "comparison"`; optional links into existing product/supplier cards via `entity_refs` |
| `FollowUpChips` | Renders typed chips; submits `prompt` and, when present, chip.`intent` as `intent_hint` |

Chip click behavior:

- Always submit `prompt` as the next user query
- If the chip includes `intent` (`research` | `compare` | `refine`), pass it as
  `intent_hint` — no client-side heuristics
- `kind` is display/priority only (`action` may be visually emphasized)

### Phase 2 (storefront)

| Component | Role |
|-----------|------|
| `SourcingCanvas` | Right panel; opens for `checklist` / `doc` blocks or explicit “open in canvas” |
| `AnswerMinimap` | Right-edge section markers for long assistant messages |
| `VoiceControls` | Mic (STT into input) + optional voice-mode control on `SourcingInput` |

## SME behavior

- Procurement-grade criteria: specs/grades, certifications, MOQ, lead time,
  region/service coverage, total cost of ownership — not marketing fluff
- Compare scores entities against the buyer’s stated need and tenant
  personalization when available
- Prefer evidence: catalog metadata and web citations; mark gaps as `unverified`
- Vendor-neutral unless the buyer asks for a recommendation

## Error handling (soft-fail)

| Failure | Behavior |
|---------|----------|
| Classifier error / low confidence | Treat as `research` |
| Compare with &lt;2 entities | No table; brief + “which two?” action chip |
| Compare LLM / JSON parse failure | Fall back to research; `status: partial` |
| Unknown `ui_blocks.type` | Storefront ignores block |
| Phase 2 voice/canvas failure | Local UI degrade; search still works |

The engine **never** raises to the storefront for these paths (same philosophy
as today’s sourcing soft-fail).

## Testing

### Orchestrator (`ai-orchestrator-api`)

- Classifier: hint wins; research/compare/refine mapping; low-confidence fallback
- Entity gather: history picks + suppliers + named entities; &lt;2 entity path
- Compare schema parse + soft-fail to research
- Response schema: typed follow_ups, ui_blocks, intent

### Storefront (`b2c-marketplace-storefront`)

- `ComparisonBlock` rendering from fixture
- `FollowUpChips` passes chip.`intent` through as `intent_hint` when set
- `UiBlockRenderer` ignores unknown types
- Legacy string `follow_ups` normalization

### Contract fixtures

Shared JSON fixtures for: research, compare (suppliers), compare (products),
refine, partial fallback.

## Repo touch list

### `ai-orchestrator-api`

- `workflows/sourcing/schemas.py` — `intent_hint`, typed follow_ups, `ui_blocks`, `intent`
- `workflows/sourcing/intent.py` — classifier (new)
- `workflows/sourcing/compare.py` — compare workflow (new)
- `workflows/sourcing/engine.py` — router; upgrade research prompt for typed chips
- Unit tests under `tests/unit/sourcing/`

### `tese-backend`

- Passthrough of `intent_hint` and new response fields on
  `/api/v3/storefront/sourcing/search` (no business logic)

### `b2c-marketplace-storefront`

- `SourcingWorkspace` — render `ui_blocks`, typed chips, pass `intent_hint`
- New components: `UiBlockRenderer`, `ComparisonBlock`, `FollowUpChips` (or evolve existing)
- Phase 2: `SourcingCanvas`, `AnswerMinimap`, `VoiceControls`
- API route / BFF types updated for new fields

## Out of scope

- Token streaming
- Real multi-model switching (selector remains cosmetic unless separately scoped)
- File upload OCR / attachment understanding
- Word/PDF export (can follow canvas in a later pass)
- Changes to Matrix buyer↔seller messaging

## Success criteria

**Phase 1**

1. Asking “compare X vs Y” (or clicking a compare action chip) yields an inline
   comparison table when ≥2 entities are available
2. Non-compare queries do **not** emit comparison blocks
3. Follow-up chips include at least one actionable next step when results exist
4. Classifier/compare failures never 500; UI still shows a usable brief
5. Unit/component tests above pass in CI

**Phase 2**

6. Artifact intents open/update the canvas panel
7. Long answers expose a working section minimap
8. Voice STT can populate the composer without breaking text input
