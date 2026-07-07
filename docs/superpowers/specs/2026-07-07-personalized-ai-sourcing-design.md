# Personalized AI Sourcing — design

> Cross-repo feature. Touches: `b2c-marketplace-storefront` (UI), `tese-backend`
> (identity + proxy), `ai-orchestrator-api` (personalization brain). Spec kept
> here with the session's other specs; each repo's changes are listed per layer.

## Context

The storefront's **AI Sourcing** page (`/sourcing`, model selector labelled
"Tesera AI") is a natural-language B2B procurement copilot. Today it is **not
personalized**:

- The request carries only `{ query, chat_history }` to
  `POST /api/v3/storefront/sourcing/search` (tese-backend, a thin proxy) →
  `POST /api/v1/sourcing/search` (orchestrator).
- The orchestrator runs **Claude Sonnet 4.5** (`workflows/sourcing/engine.py`,
  `run_sourcing`) over candidates from a **Weaviate hybrid search** on the global
  `MarketplaceCatalog` collection + a Medusa catalogue pull, plus Anthropic's
  native web-search tool for external suppliers.
- The orchestrator's `SourcingRequest` (`workflows/sourcing/schemas.py`) has **no
  `tenant_id`/`user_id`** — results are identical for every user. The "Tesera AI"
  selector and the "Recent" list are UI-only (history is device-local
  `localStorage`).

Two assets make personalization cheap to add:

1. **A personalized path already exists** — `POST /api/v1/marketplace/recommend`
   (`workflows/marketplace_recommend/`): `context.get_project_context(tenant_id)`
   loads the tenant profile from Mongo; `fuse_rank.py` boosts candidates whose
   industry/categories overlap the tenant; `prompts.py` injects tenant context
   into the LLM. The sourcing engine just doesn't use it.
2. **The identity bridge exists** — a logged-in marketplace buyer carries
   `metadata.tese_user_id` on the Medusa customer (set by the tese-SSO provider);
   tese-backend can resolve `tese_user_id → user_tenant_v2 → tenant_id` and load
   all `tenant_id`-scoped data. A tenant's own knowledge is also already indexed
   in the tenant-scoped Weaviate collection **`TenantSelfIntelligence`**
   (`weaviate_schemas/tenant_self_intelligence.py`), kept in sync from Mongo.

**Goal:** when a buyer is logged in and resolves to a tese tenant, personalize
the sourcing brief, ranking, and UI using that tenant's profile + own knowledge —
while the anonymous path stays exactly as it is today.

## Architecture & data flow

```
storefront /api/sourcing (server route)
  → retrieveCustomer() → customer.metadata.tese_user_id   (absent if logged out)
  → POST tese-backend /sourcing/search { query, chat_history, tese_user_id? }
      → resolve tese_user_id → user_tenant_v2 → tenant_id  (primary membership)
      → POST orchestrator /api/v1/sourcing/search { query, chat_history, candidates, tenant_id? }
          → if tenant_id:
              get_project_context(tenant_id)          # structured: industry, sector, goals, certs
              TenantSelfIntelligence hybrid search     # semantic: targets, ESG goals, past enquiries
              fuse_rank boost (industry/cert overlap)
              tenant-aware prompt block → Claude
          → answer + catalog_picks[+match_reasons] + suppliers + personalization{...}
```

No `tese_user_id` → no `tenant_id` → the flow is byte-for-byte today's generic
search. Personalization is strictly additive and best-effort: any failure to
resolve/​load tenant data falls back to the generic path.

## Layer 1 — Identity + context pipeline

**Repo: `b2c-marketplace-storefront`**
- `src/app/api/sourcing/route.ts` — call `retrieveCustomer()` server-side; if the
  customer has `metadata.tese_user_id`, include it in the body sent to
  `proxySourcingSearch`. (`retrieveCustomer` already returns the customer with
  metadata.)
- `src/lib/storefront-bff.ts` — `proxySourcingSearch` passes `tese_user_id`
  through to `/sourcing/search`.

**Repo: `tese-backend`**
- `controllers/v3/storefront/storefrontController.js` `_sourcingSearch` — read
  optional `tese_user_id` from the body; resolve to a `tenant_id` using the
  existing user↔tenant helpers (`services/v2/users/userTenantHelper.js` /
  `models/v1/users/userTenantV2.js`). **Multi-tenant rule:** pick the primary
  membership — the one with `organization_admin: true`, else the first — and
  ignore the rest in Phase 1 (a tenant switcher is a later add-on).
- `services/v3/storefront/sourcingService.js` `runSourcingSearch` — accept
  `tenant_id`, forward it in the orchestrator `/api/v1/sourcing/search` body.
- Best-effort: if resolution fails, omit `tenant_id` and continue.

## Layer 2 — Orchestrator personalization

**Repo: `ai-orchestrator-api`**
- `workflows/sourcing/schemas.py` — add optional `tenant_id: str | None` to
  `SourcingRequest` and a `personalization` object to the response schema
  (`{ company_name, applied: string[] }`), plus optional `match_reasons: string[]`
  on each catalog pick.
- `workflows/sourcing/engine.py` `run_sourcing` — when `tenant_id` is present:
  1. Load the structured profile via the existing
     `marketplace_recommend/context.get_project_context(tenant_id)` (industry,
     sector, `sustainability_goals`, certifications).
  2. Run a **tenant-scoped `TenantSelfIntelligence` hybrid search** (reuse the
     existing Weaviate client + this collection's query helper) for the tenant's
     own goals/targets/past enquiries most relevant to the query. Run it in
     parallel with candidate retrieval.
  3. Boost candidates whose category/industry_focus/certs overlap the tenant
     (reuse `marketplace_recommend/fuse_rank.py`'s boost logic).
  4. Inject a compact tenant block into `SOURCING_SYSTEM` / the user turn (company,
     sector, goals, certs, top retrieved facts) so Claude tailors the brief and
     explains fit.
  5. Populate `personalization` (company + which signals were applied) and, where
     the model attributes a pick to a tenant signal, per-pick `match_reasons`.
- All tenant reads are tenant-scoped; nothing cross-tenant enters a prompt.

## Layer 3 — Storefront UI

**Repo: `b2c-marketplace-storefront`** (`src/components/sections/SourcingWorkspace/`)
- When a response includes `personalization`, render a **"Personalised for
  {company_name}"** line above the brief and a small collapsible **"Your sourcing
  context"** panel (sector, goals/certs used).
- **Match badges:** each `CatalogCard` shows its pick's `match_reasons`
  (e.g. "Matches your GOTS certification", "Supports your 2027 recycled-content
  target").
- **Sector-relevant quick prompts:** when the tenant's sector is known, swap
  in/prepend sector-appropriate entries in `QUICK_PROMPTS` (constants.ts).
- **Greeting/empty state:** the pre-search hero greets by company when logged in.
- Logged-out (no `personalization` in the response) = today's UI unchanged.

## Guardrails / decisions

- **Privacy:** inject only the acting tenant's own sourcing-relevant data
  (industry, sector, goals, certifications, targets, past enquiries). Never raw
  financials, never another tenant's data. Catalogue retrieval stays global.
- **Multi-tenant:** Phase 1 uses the primary membership; a switcher is out of
  scope.
- **Best-effort & anonymous parity:** personalization never blocks or degrades the
  base search; missing identity/tenant/data → generic result.
- **Latency:** cache the resolved `tenant_id` + structured context per session
  (short TTL); run the semantic query concurrently with candidate retrieval.

## Response contract (new fields, all optional)

```
SourcingResult {
  ...existing (status, answer, catalog_picks, suppliers, follow_ups, meta),
  catalog_picks[].match_reasons?: string[],
  personalization?: { company_name: string, applied: string[] }   // absent when anonymous
}
```

## Verification (staging)

1. **Logged-in, tenant with sector + goals:** sourcing brief + picks reflect the
   tenant's sector/goals; UI shows "Personalised for {Company}", match badges, and
   the context panel; sector quick-prompts appear.
2. **Logged-out:** request has no `tese_user_id`; response has no
   `personalization`; UI identical to today.
3. **Logged-in buyer with no tese tenant:** graceful generic result (no crash, no
   personalization block).
4. **Failure injection:** tenant resolve / context load / Weaviate query failing
   still returns the generic result.
5. **Privacy check:** confirm the prompt sent to Claude contains only the acting
   tenant's data (log/inspect in a dev run).

## Non-goals

Tenant switcher UI, personalizing other AI surfaces (Tesera ESG chat, voice),
seller-side sourcing personalization, exposing financials, and re-indexing /
changing the `TenantSelfIntelligence` sync (reuse as-is).
