# Persistent Personalized Sourcing Sessions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn AI Sourcing into a persistent, account-tied, tenant-personalized copilot. When a logged-in buyer resolves (server-side, via the trusted tese-SSO identity) to a tese tenant, every sourcing turn draws on that tenant's profile + own knowledge, and the whole conversation is stored server-side as a thread keyed to the buyer — so follow-ups carry real context, threads survive across devices, and the resolved tenant persists for the life of the thread. The anonymous path stays byte-for-byte identical (device-local `localStorage`, no personalization).

**Architecture:** The server-side thread is the carrier of personalization. Flow:

```
storefront /api/sourcing (server route)
  → POST tese-backend /v3/storefront/sourcing/search { query, thread_id?, chat_history? }   [Bearer + BFF key]
      → storefrontBffGuard resolves Medusa customer from the Bearer → req.storefront_customer
      → _sourcingSearch:
          → if customer + token: fetchTeseIdentity(token)  → TRUSTED tese_user_id
                 (calls marketplace-backend GET /store/tese-identity → getTrustedTeseUserId)
          → _resolvePrimaryTenantId(tese_user_id) → tenant_id (primary membership)
          → load thread (by thread_id, scoped to customer) or create one (keyed medusaCustomerId + tese_user_id + tenant_id)
          → chat_history = thread messages (server-authoritative); else req.body.chat_history (anonymous)
          → runSourcingSearch({ query, chat_history, tenant_id })  → orchestrator (+tenant_id)
          → append the turn to the thread; return { ...result, thread_id, personalization }
```

The orchestrator's `run_sourcing`, when `tenant_id` is present, loads a `TenantSummary` (Mongo) + retrieves tenant facts from the tenant-scoped `TenantSelfIntelligence` Weaviate collection, injects a tenant block into the Claude prompt, boosts matching candidates, and returns `personalization { company_name, sector, applied[] }` + per-pick `match_reasons`. Any failure at any hop falls back to the generic result.

**Tech Stack:** Python 3 / FastAPI / Pydantic v2 / Weaviate v4 / pytest (orchestrator); Node/Express/Mongoose (tese-backend); Medusa v2 / TypeScript (tese-marketplace-backend); Next.js App Router / React / TS (storefront).

**Spec:** `docs/superpowers/specs/2026-07-07-personalized-ai-sourcing-design.md`.

**Supersedes:** `docs/superpowers/plans/2026-07-07-personalized-ai-sourcing-backend.md`. That plan's orchestrator tasks (its Task 1–3) are reused verbatim as Phase 1 here. Its Task 4 (tenant resolve) is absorbed into Phase 3 with the thread rewrite. Its Task 5 (storefront forwards `customer.metadata.tese_user_id`) is **dropped and replaced** by the trusted server-side resolution in Phase 2 — do not implement it.

## Global Constraints

- **Best-effort & anonymous parity (non-negotiable):** personalization and sessions are strictly additive. No authenticated customer → no `tese_user_id` → no `tenant_id` → no thread → the request/response are exactly today's, using `req.body.chat_history`. Any resolve/load/query/persist failure degrades to the generic result — never a 4xx/5xx to the user for a personalization or session failure.
- **Trusted identity only:** the tenant is resolved from the **tese-SSO auth identity** (`getTrustedTeseUserId`, provider `tese-sso`, `provider_identity.user_metadata.tese_user_id`) — **never** from `customer.metadata`, which store customers can write themselves (impersonation risk). The storefront never sends an identity in a client-controllable body field; tese-backend derives it server-side from the forwarded Bearer.
- **Privacy:** inject only the acting tenant's own sourcing-relevant fields (company_name, industry, sector, sustainability_goals, retrieved `TenantSelfIntelligence` summaries). Never another tenant's data; never raw financials. Catalogue retrieval stays global. Threads are scoped by `medusaCustomerId` on every read/write.
- **Multi-tenant:** use the buyer's **primary** membership — the `UserTenantV2` row with `organization_admin: true`, else the most recent (`updatedAt` desc). No switcher.
- **Weaviate `TenantSelfIntelligence` is multi-tenancy-enabled** — every query MUST be tenant-scoped via `.with_tenant(tenant_id)`. Reuse `query_processor/common/weaviate_queries.py` (`_bounded_search`), which enforces this.
- **No new dependencies** in any repo.
- **Response contract (new, all optional):** `SourcingResponse.personalization: { company_name: str, sector: str, applied: list[str] } | None`; `CatalogPick.match_reasons: list[str]` (default `[]`); tese-backend adds `thread_id: str` to the response when a thread is used.
- **Commit scoping:** several repos have unrelated uncommitted WIP (storefront inbox redesign; tese-marketplace-backend connect plugin). Commit ONLY this task's files by explicit path; never `git add -A`.
- **Repos & run:**
  - orchestrator `/home/ubuntu/tese/ai-orchestrator-api` — tests in `tests/`, `pytest.ini` `asyncio_mode=auto`; run one: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_x.py -v`. Default port 8000; tese-backend defaults `AI_ORCHESTRATOR_API_URL=http://localhost:8002`.
  - tese-backend `/home/ubuntu/tese/tese-backend` — no controller unit-test harness; verify by running (`pm2`/staging per `[[staging-deploy-workflow]]`). BFF header `x-storefront-bff-key`, env `STOREFRONT_BFF_API_KEY`. Marketplace base env `MEDUSA_BACKEND_URL` (default `http://localhost:9000`).
  - marketplace-backend `/home/ubuntu/tese/tese-marketplace-backend` (Medusa v2 monorepo; b2c module at `packages/modules/b2c-core`).
  - storefront `/home/ubuntu/tese/b2c-marketplace-storefront` — `npx tsc --noEmit`; dev `localhost:3000`.
- **Staging identities:** buyer `matrix-test@tese.io` / `secret123`. A positive personalization test needs a buyer whose tese-SSO identity maps (via `user_tenant_v2`) to a tenant with `industry`/`sector`/`sustainability_goals` populated (see Phase 5).

---

## Phase 1 — Orchestrator personalization (reused)

The orchestrator changes are already fully specified, TDD-stepped, and unchanged under this architecture. **Execute, verbatim, Tasks 1, 2, and 3 of** `docs/superpowers/plans/2026-07-07-personalized-ai-sourcing-backend.md`:

- **Backend-plan Task 1** — extend `workflows/sourcing/schemas.py`: `SourcingRequest.tenant_id`, `CatalogPick.match_reasons`, `Personalization`, `SourcingResponse.personalization`. (+ test `tests/unit/sourcing/test_schemas.py`.)
- **Backend-plan Task 2** — new `workflows/sourcing/personalization.py` (`load_tenant_summary`, `retrieve_tenant_facts`, `build_tenant_block`, `boost_candidates`, `applied_signals`). (+ test.)
- **Backend-plan Task 3** — wire personalization into `run_sourcing` in `workflows/sourcing/engine.py` (tenant block injection, `personalization` on all return paths, `match_reasons` preserved in `_coerce_picks`, `SOURCING_SYSTEM` contract line). (+ test.)

Do **not** execute that plan's Task 4 or Task 5 here — they are replaced by Phases 2–4 below. After finishing the three orchestrator tasks, continue to Task 1b.

### Task 1b: Orchestrator — add `sector` to `Personalization` (for sector-relevant UI)

The storefront's sector-specific quick prompts (Phase 4) need the tenant's sector string in the response.

**Files:**
- Modify: `ai-orchestrator-api/query_processor/workflows/sourcing/schemas.py`
- Modify: `ai-orchestrator-api/query_processor/workflows/sourcing/engine.py`
- Test: `ai-orchestrator-api/tests/unit/sourcing/test_schemas.py` (extend), `tests/unit/sourcing/test_engine_personalization.py` (extend)

**Interfaces:**
- Produces: `Personalization.sector: str = ""`; `run_sourcing` sets `personalization.sector = summary.sector or ""`.

- [ ] **Step 1: Extend the schema test**

Append to `tests/unit/sourcing/test_schemas.py`:
```python
def test_personalization_has_sector_default_empty():
    from query_processor.workflows.sourcing.schemas import Personalization
    p = Personalization(company_name="Acme")
    assert p.sector == ""
    p2 = Personalization(company_name="Acme", sector="Consumer Goods", applied=["sector"])
    assert p2.sector == "Consumer Goods"
```

- [ ] **Step 2: Extend the engine test**

In `tests/unit/sourcing/test_engine_personalization.py`, inside `test_personalized_run_injects_block_and_sets_personalization`, after the existing `assert resp.personalization.company_name == "Acme Textiles"` line add:
```python
    assert resp.personalization.sector == "Consumer Goods"
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_schemas.py::test_personalization_has_sector_default_empty tests/unit/sourcing/test_engine_personalization.py -v`
Expected: FAIL — `Personalization` has no `sector` / attribute missing.

- [ ] **Step 4: Add the field and populate it**

In `schemas.py`, add to `Personalization` (after `company_name`):
```python
    sector: str = ""
```

In `engine.py` `run_sourcing`, where `Personalization(...)` is constructed, add the `sector` kwarg:
```python
            personalization = Personalization(
                company_name=summary.company_name,
                sector=summary.sector or "",
                applied=applied_signals(summary, facts),
            )
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/ -v`
Expected: PASS (all sourcing unit tests green).

- [ ] **Step 6: Commit**

```bash
cd /home/ubuntu/tese/ai-orchestrator-api
git add query_processor/workflows/sourcing/schemas.py query_processor/workflows/sourcing/engine.py tests/unit/sourcing/test_schemas.py tests/unit/sourcing/test_engine_personalization.py
git commit -m "sourcing: expose tenant sector in personalization response"
```

---

## Phase 2 — Trusted identity resolution

Give tese-backend a way to learn the logged-in buyer's **trusted** tese user id, derived server-side from the tese-SSO auth identity — never from client-writable metadata.

### Task 2.1: marketplace-backend — `GET /store/tese-identity` returns the trusted tese user id

**Files:**
- Create: `tese-marketplace-backend/packages/modules/b2c-core/src/api/store/tese-identity/route.ts`
- Modify: `tese-marketplace-backend/packages/modules/b2c-core/src/api/store/middlewares.ts`

**Interfaces:**
- Consumes: `getTrustedTeseUserId(req)` from the shared matrix barrel (`packages/modules/b2c-core/src/shared/matrix`), which reads `req.auth_context.auth_identity_id` → AUTH module → `provider_identities` → `provider === 'tese-sso'` → `user_metadata.tese_user_id`.
- Produces: `GET /store/tese-identity` (customer-authenticated) → `{ tese_user_id: string | null }`.

- [ ] **Step 1: Create the route**

Create `packages/modules/b2c-core/src/api/store/tese-identity/route.ts`:
```ts
import { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework'

import { getTrustedTeseUserId } from '../../../shared/matrix'

/**
 * @oas [get] /store/tese-identity
 * operationId: "StoreGetTeseIdentity"
 * summary: "Return the authenticated customer's trusted tese user id"
 * description: >
 *   Resolves the tese user id from the tese-SSO auth identity (never from
 *   customer.metadata, which the customer can write). Returns null when the
 *   customer is not tese-SSO linked.
 * x-authenticated: true
 * responses:
 *   "200":
 *     description: OK
 * tags:
 *   - Store Tese
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 */
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const teseUserId = await getTrustedTeseUserId(req)
  return res.json({ tese_user_id: teseUserId })
}
```

(Import depth: from `src/api/store/tese-identity/` to `src/shared/matrix` is `../../../shared/matrix`. Confirm the barrel re-exports `getTrustedTeseUserId` — it does, per `store/matrix/token/route.ts`.)

- [ ] **Step 2: Register the auth middleware**

In `packages/modules/b2c-core/src/api/store/middlewares.ts`, add a matcher inside the `storeMiddlewares` array (next to the `/store/matrix/*` entry):
```ts
  {
    matcher: "/store/tese-identity",
    method: ["GET"],
    middlewares: [authenticate("customer", ["bearer", "session"])],
  },
```
(`authenticate` is already imported at the top of the file.)

- [ ] **Step 3: Build & run the marketplace backend, verify the route**

Rebuild the b2c-core module / restart the marketplace backend (per its dev workflow). With a customer bearer token for a tese-SSO buyer:
```bash
curl -s "$MEDUSA_BACKEND_URL/store/tese-identity" \
  -H "x-publishable-api-key: $MEDUSA_PUBLISHABLE_API_KEY" \
  -H "Authorization: Bearer <CUSTOMER_JWT>" | python3 -m json.tool
```
Expected: `{ "tese_user_id": "<id>" }` for a linked buyer; `{ "tese_user_id": null }` for a non-SSO customer. A request with no/invalid bearer returns 401 (guarded).

- [ ] **Step 4: Commit**

```bash
cd /home/ubuntu/tese/tese-marketplace-backend
git add packages/modules/b2c-core/src/api/store/tese-identity/route.ts packages/modules/b2c-core/src/api/store/middlewares.ts
git commit -m "store: add /store/tese-identity returning the trusted tese user id"
```

### Task 2.2: tese-backend — `fetchTeseIdentity` in the Medusa store client

**Files:**
- Modify: `tese-backend/services/v3/storefront/medusaStoreClient.js`

**Interfaces:**
- Consumes: `getMedusaStoreConfig`, `storeHeaders` (already in the file); marketplace `GET /store/tese-identity` (Task 2.1).
- Produces: `fetchTeseIdentity(customerToken: string) -> Promise<string | null>` — exported.

- [ ] **Step 1: Add the function**

In `services/v3/storefront/medusaStoreClient.js`, add after `fetchCustomerMe` (it reuses the same `storeHeaders`, which already sets the publishable key + Bearer):
```javascript
async function fetchTeseIdentity (customerToken) {
  if (!customerToken) return null
  const { baseUrl } = getMedusaStoreConfig()
  try {
    const { data } = await axios.get(`${baseUrl}/store/tese-identity`, {
      headers: storeHeaders(customerToken),
      timeout: 15000
    })
    const id = data && data.tese_user_id
    return typeof id === 'string' && id ? id : null
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Export it**

Add `fetchTeseIdentity` to the `module.exports` object in the same file (alongside `fetchCustomerMe`).

- [ ] **Step 3: Sanity check (node require)**

```bash
cd /home/ubuntu/tese/tese-backend
node -e "const m=require('./services/v3/storefront/medusaStoreClient'); console.log(typeof m.fetchTeseIdentity)"
```
Expected: `function`.

- [ ] **Step 4: Commit**

```bash
cd /home/ubuntu/tese/tese-backend
git add services/v3/storefront/medusaStoreClient.js
git commit -m "storefront: fetchTeseIdentity via marketplace /store/tese-identity"
```

---

## Phase 3 — Server-side sourcing sessions (tese-backend)

Persist each buyer's sourcing conversation as a thread, resolve their tenant once per thread, and feed the thread's history + tenant to the orchestrator.

### Task 3.1: `sourcing_thread` Mongoose model

**Files:**
- Create: `tese-backend/models/v3/storefront/sourcingThread.js`

**Interfaces:**
- Produces: default-exported `SourcingThread` model (collection `sourcing_threads`). Fields: `medusaCustomerId` (String, indexed, required), `teseUserId` (String|null), `tenantId` (String|null), `title` (String), `messages` (array of `{ role: 'user'|'assistant', content: String, result: Mixed|null, createdAt: Date }`), `lastQuery` (String), timestamps.

- [ ] **Step 1: Create the model** (follows the `storefrontEnquiry.js` convention — String `medusaCustomerId` scoping, explicit collection, `versionKey:false`, default export)

Create `models/v3/storefront/sourcingThread.js`:
```javascript
'use strict'

const mongoose = require('mongoose')
const { Schema } = mongoose

const SourcingMessageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, default: '' },
  // Full SourcingResult for assistant turns, so the UI can re-render past
  // picks/suppliers/follow_ups/personalization. Null for user turns.
  result: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

const SourcingThreadSchema = new Schema({
  medusaCustomerId: { type: String, required: true, index: true },
  teseUserId: { type: String, default: null, index: true },
  tenantId: { type: String, default: null },
  title: { type: String, trim: true, default: '' },
  lastQuery: { type: String, default: '' },
  messages: { type: [SourcingMessageSchema], default: [] }
}, {
  timestamps: true,
  strict: true,
  versionKey: false,
  collection: 'sourcing_threads'
})

SourcingThreadSchema.index({ medusaCustomerId: 1, updatedAt: -1 })

module.exports =
  mongoose.models.SourcingThread ||
  mongoose.model('SourcingThread', SourcingThreadSchema)
```

- [ ] **Step 2: Sanity check**

```bash
cd /home/ubuntu/tese/tese-backend
node -e "const M=require('./models/v3/storefront/sourcingThread'); console.log(M.modelName, M.collection.name)"
```
Expected: `SourcingThread sourcing_threads`.

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/tese/tese-backend
git add models/v3/storefront/sourcingThread.js
git commit -m "storefront: sourcing_threads model (persistent sourcing sessions)"
```

### Task 3.2: `sourcingThreadService` — thread CRUD + history mapping

**Files:**
- Create: `tese-backend/services/v3/storefront/sourcingThreadService.js`

**Interfaces:**
- Consumes: `SourcingThread` model (Task 3.1).
- Produces (all scope by `medusaCustomerId`; all best-effort, never throw to the caller path that isn't explicitly a route):
  - `createThread({ medusaCustomerId, teseUserId, tenantId, title }) -> thread doc | null`
  - `getThreadForCustomer(threadId, medusaCustomerId) -> thread doc | null`
  - `listThreadsForCustomer(medusaCustomerId, { limit=30 }) -> [{ id, title, lastQuery, updatedAt, createdAt }]`
  - `appendTurn(threadId, { userContent, assistant: { content, result } }) -> void`
  - `deleteThreadForCustomer(threadId, medusaCustomerId) -> boolean`
  - `threadToChatHistory(thread, { limit=6 }) -> [{ role, content }]` (assistant content = `result.answer` when present, mirroring the storefront's mapping)
  - `titleFromQuery(query) -> string` (≤ 60 chars)

- [ ] **Step 1: Create the service**

Create `services/v3/storefront/sourcingThreadService.js`:
```javascript
'use strict'

const mongoose = require('mongoose')
const SourcingThread = require('../../../models/v3/storefront/sourcingThread')

function titleFromQuery (query) {
  const q = String(query || '').trim().replace(/\s+/g, ' ')
  if (!q) return 'New sourcing search'
  return q.length > 60 ? `${q.slice(0, 57)}...` : q
}

function _isValidId (id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id)
}

async function createThread ({ medusaCustomerId, teseUserId = null, tenantId = null, title = '' }) {
  if (!medusaCustomerId) return null
  try {
    return await SourcingThread.create({
      medusaCustomerId,
      teseUserId,
      tenantId,
      title: title || 'New sourcing search',
      messages: []
    })
  } catch {
    return null
  }
}

async function getThreadForCustomer (threadId, medusaCustomerId) {
  if (!_isValidId(threadId) || !medusaCustomerId) return null
  try {
    return await SourcingThread.findOne({ _id: threadId, medusaCustomerId })
  } catch {
    return null
  }
}

async function listThreadsForCustomer (medusaCustomerId, { limit = 30 } = {}) {
  if (!medusaCustomerId) return []
  try {
    const rows = await SourcingThread.find({ medusaCustomerId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select({ title: 1, lastQuery: 1, updatedAt: 1, createdAt: 1 })
      .lean()
    return rows.map((r) => ({
      id: String(r._id),
      title: r.title || 'New sourcing search',
      lastQuery: r.lastQuery || '',
      updatedAt: r.updatedAt,
      createdAt: r.createdAt
    }))
  } catch {
    return []
  }
}

async function appendTurn (threadId, { userContent, assistant }) {
  if (!_isValidId(threadId)) return
  const messages = []
  if (userContent) {
    messages.push({ role: 'user', content: String(userContent), result: null, createdAt: new Date() })
  }
  if (assistant) {
    messages.push({
      role: 'assistant',
      content: String(assistant.content || ''),
      result: assistant.result || null,
      createdAt: new Date()
    })
  }
  if (!messages.length) return
  try {
    await SourcingThread.updateOne(
      { _id: threadId },
      { $push: { messages: { $each: messages } }, $set: { lastQuery: String(userContent || '') } }
    )
  } catch {
    // best-effort persistence; never break the search response
  }
}

async function deleteThreadForCustomer (threadId, medusaCustomerId) {
  if (!_isValidId(threadId) || !medusaCustomerId) return false
  try {
    const r = await SourcingThread.deleteOne({ _id: threadId, medusaCustomerId })
    return r.deletedCount > 0
  } catch {
    return false
  }
}

function threadToChatHistory (thread, { limit = 6 } = {}) {
  if (!thread || !Array.isArray(thread.messages)) return []
  const turns = thread.messages.map((m) => ({
    role: m.role,
    content: m.role === 'assistant' && m.result && m.result.answer
      ? String(m.result.answer)
      : String(m.content || '')
  }))
  return turns.slice(-limit)
}

module.exports = {
  titleFromQuery,
  createThread,
  getThreadForCustomer,
  listThreadsForCustomer,
  appendTurn,
  deleteThreadForCustomer,
  threadToChatHistory
}
```

- [ ] **Step 2: Sanity check (require + shape)**

```bash
cd /home/ubuntu/tese/tese-backend
node -e "const s=require('./services/v3/storefront/sourcingThreadService'); console.log(s.titleFromQuery('a'.repeat(80)).length, s.threadToChatHistory({messages:[{role:'user',content:'hi'},{role:'assistant',content:'x',result:{answer:'ANS'}}]}))"
```
Expected: `60 [ { role: 'user', content: 'hi' }, { role: 'assistant', content: 'ANS' } ]`.

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/tese/tese-backend
git add services/v3/storefront/sourcingThreadService.js
git commit -m "storefront: sourcing thread service (CRUD + chat-history mapping)"
```

### Task 3.3: `_resolvePrimaryTenantId` + rewrite `_sourcingSearch` (identity → tenant → thread)

**Files:**
- Modify: `tese-backend/controllers/v3/storefront/storefrontController.js`
- Modify: `tese-backend/services/v3/storefront/sourcingService.js` (accept + forward `tenant_id`)

**Interfaces:**
- Consumes: `UserTenantV2` (`models/v1/users/userTenantV2.js`, `{ user_id, tenant_id, organization_admin, updatedAt }`); `fetchTeseIdentity` (Task 2.2); thread service (Task 3.2); `req.storefront_customer` (Medusa customer, has `.id`) + `req.storefront_customer_token` (raw bearer) set by `storefrontBffGuard`.
- Produces: `_sourcingSearch` uses the thread's history + resolved `tenant_id`; response gains `thread_id` when a thread is used. `runSourcingSearch({ query, chat_history, tenant_id })` forwards `tenant_id` to the orchestrator.

- [ ] **Step 1: Forward `tenant_id` from `runSourcingSearch`**

In `services/v3/storefront/sourcingService.js`, change the signature and the orchestrator POST body (add `tenant_id` only when set, to keep anonymous calls byte-identical):
```javascript
async function runSourcingSearch ({ query, chat_history = [], tenant_id = null }) {
```
Where the body object is built for the `axios.post(`${ORCHESTRATOR_URL}${SOURCING_PATH}`, ...)` call, add:
```javascript
  const body = {
    query: q,
    chat_history: history,
    candidates,
    include_web: true,
    max_web: 4
  }
  if (tenant_id) body.tenant_id = tenant_id
  const { data } = await axios.post(`${ORCHESTRATOR_URL}${SOURCING_PATH}`, body, _orchestratorConfig())
```
(Keep the existing query-trim/empty guard, `buildCandidatePool`, `catalog_picks` hydration, and return shape. `personalization`/`match_reasons` pass through inside `data` untouched.)

- [ ] **Step 2: Add requires + resolver to the controller**

At the top of `controllers/v3/storefront/storefrontController.js` (with the other requires):
```javascript
const { UserTenantV2 } = require('../../../models/v1/users/userTenantV2')
const { fetchTeseIdentity } = require('../../../services/v3/storefront/medusaStoreClient')
const {
  titleFromQuery,
  createThread,
  getThreadForCustomer,
  appendTurn,
  threadToChatHistory
} = require('../../../services/v3/storefront/sourcingThreadService')
```

Add a resolver helper above `_sourcingSearch`:
```javascript
/**
 * Resolve a trusted tese user id to their primary tenant id (org-admin first,
 * else most-recently-updated membership). Best-effort: null on any problem.
 */
async function _resolvePrimaryTenantId (teseUserId) {
  if (!teseUserId) return null
  try {
    const rows = await UserTenantV2.find({ user_id: teseUserId })
      .sort({ organization_admin: -1, updatedAt: -1 })
      .limit(1)
      .lean()
    return rows && rows[0] ? String(rows[0].tenant_id) : null
  } catch {
    return null
  }
}
```

- [ ] **Step 3: Rewrite `_sourcingSearch`**

Replace the body of `_sourcingSearch` with:
```javascript
async function _sourcingSearch (req, res) {
  try {
    const { query, thread_id } = req.body || {}
    const customer = req.storefront_customer || null
    const token = req.storefront_customer_token || null

    let tenantId = null
    let teseUserId = null
    let thread = null

    // Trusted, server-side identity + session — only for authenticated buyers.
    if (customer && customer.id && token) {
      teseUserId = await fetchTeseIdentity(token)
      tenantId = await _resolvePrimaryTenantId(teseUserId)

      if (thread_id) {
        thread = await getThreadForCustomer(thread_id, customer.id)
      }
      if (!thread) {
        thread = await createThread({
          medusaCustomerId: customer.id,
          teseUserId,
          tenantId,
          title: titleFromQuery(query)
        })
      }
    }

    // Server-authoritative history when we have a thread; else the anonymous
    // device-local history the client sent (today's behaviour).
    const chat_history = thread
      ? threadToChatHistory(thread)
      : (req.body && req.body.chat_history) || []

    const data = await runSourcingSearch({ query, chat_history, tenant_id: tenantId })

    if (thread) {
      await appendTurn(thread._id, {
        userContent: query,
        assistant: { content: data && data.answer, result: data }
      })
      data.thread_id = String(thread._id)
    }

    return res.status(200).json(data)
  } catch (err) {
    return res.status(200).json({
      status: 'error',
      answer: (err && err.message) || 'Sourcing search failed',
      suppliers: [],
      catalog_picks: [],
      follow_ups: [],
      meta: {}
    })
  }
}
```

- [ ] **Step 4: Verify (running services)**

Restart tese-backend + orchestrator (+ marketplace backend from Phase 2). See Phase 5 for the end-to-end curls. Quick check: an authenticated sourcing POST returns a `thread_id`; a second POST with that `thread_id` continues the same thread (a follow-up like "and cheaper?" resolves against the prior turn).

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/tese/tese-backend
git add controllers/v3/storefront/storefrontController.js services/v3/storefront/sourcingService.js
git commit -m "storefront sourcing: trusted tenant resolution + server-side thread sessions"
```

### Task 3.4: thread CRUD routes (list / get / delete)

**Files:**
- Modify: `tese-backend/routes/v3/storefront/index.js`
- Modify: `tese-backend/controllers/v3/storefront/storefrontController.js` (add 3 handlers + export)

**Interfaces:**
- Consumes: `listThreadsForCustomer`, `getThreadForCustomer`, `deleteThreadForCustomer` (Task 3.2); `requireStorefrontCustomer` guard.
- Produces: `GET /v3/storefront/sourcing/threads`, `GET /v3/storefront/sourcing/threads/:id`, `DELETE /v3/storefront/sourcing/threads/:id` — all customer-scoped.

- [ ] **Step 1: Add controller handlers**

In `storefrontController.js`, extend the thread-service require from Task 3.3 to also import the list/get/delete fns:
```javascript
const {
  titleFromQuery,
  createThread,
  getThreadForCustomer,
  appendTurn,
  threadToChatHistory,
  listThreadsForCustomer,
  deleteThreadForCustomer
} = require('../../../services/v3/storefront/sourcingThreadService')
```

Add handlers (near `_sourcingSearch`):
```javascript
async function _listSourcingThreads (req, res) {
  const customer = req.storefront_customer
  const threads = await listThreadsForCustomer(customer.id, { limit: 30 })
  return res.status(200).json({ threads })
}

async function _getSourcingThread (req, res) {
  const customer = req.storefront_customer
  const thread = await getThreadForCustomer(req.params.id, customer.id)
  if (!thread) return res.status(404).json({ status: 'not_found', thread: null })
  return res.status(200).json({
    thread: {
      id: String(thread._id),
      title: thread.title,
      tenantId: thread.tenantId || null,
      messages: (thread.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        result: m.result || null,
        createdAt: m.createdAt
      })),
      updatedAt: thread.updatedAt,
      createdAt: thread.createdAt
    }
  })
}

async function _deleteSourcingThread (req, res) {
  const customer = req.storefront_customer
  const ok = await deleteThreadForCustomer(req.params.id, customer.id)
  return res.status(200).json({ deleted: ok })
}
```

Add all three to the controller's `module.exports`.

- [ ] **Step 2: Register the routes**

In `routes/v3/storefront/index.js`, import the new handlers alongside the existing ones, and register **after** `router.use(storefrontBffGuard)` (so the BFF key is enforced) with `requireStorefrontCustomer`:
```javascript
router.get('/sourcing/threads', requireStorefrontCustomer, _listSourcingThreads)
router.get('/sourcing/threads/:id', requireStorefrontCustomer, _getSourcingThread)
router.delete('/sourcing/threads/:id', requireStorefrontCustomer, _deleteSourcingThread)
```
(Place these near the existing `router.post('/sourcing/search', _sourcingSearch)` line. Ensure `_listSourcingThreads`, `_getSourcingThread`, `_deleteSourcingThread` are in the destructured controller import at the top of the routes file.)

- [ ] **Step 3: Verify**

```bash
# with BFF key + a customer bearer
curl -s "$TESE_BACKEND/api/v3/storefront/sourcing/threads" \
  -H "x-storefront-bff-key: $STOREFRONT_BFF_API_KEY" -H "Authorization: Bearer <CUSTOMER_JWT>" \
  | python3 -m json.tool
```
Expected: `{ "threads": [ ... ] }` (includes any thread created by Task 3.3). Without a bearer → `401 "Sign in to continue"`.

- [ ] **Step 4: Commit**

```bash
cd /home/ubuntu/tese/tese-backend
git add controllers/v3/storefront/storefrontController.js routes/v3/storefront/index.js
git commit -m "storefront sourcing: thread list/get/delete routes"
```

---

## Phase 4 — Storefront: server-backed threads + personalization UI

Switch the logged-in experience from device-local `localStorage` to server threads, and render the personalization signals. Anonymous users keep today's `localStorage` behaviour unchanged.

### Task 4.1: storefront BFF — thread proxy helpers + Next route handlers

**Files:**
- Modify: `b2c-marketplace-storefront/src/lib/storefront-bff.ts` (add `proxySourcingSearch` thread fields + thread proxies)
- Create: `b2c-marketplace-storefront/src/app/api/sourcing/threads/route.ts` (GET list)
- Create: `b2c-marketplace-storefront/src/app/api/sourcing/threads/[id]/route.ts` (GET one, DELETE)

**Interfaces:**
- Consumes: `storefrontBffFetch` (forwards the customer Bearer + BFF key).
- Produces: client-callable `/api/sourcing/threads` (GET → `{ threads }`), `/api/sourcing/threads/:id` (GET → `{ thread }`, DELETE → `{ deleted }`); `proxySourcingSearch` accepts/forwards `thread_id`.

- [ ] **Step 1: Extend `proxySourcingSearch` + add thread proxies**

In `src/lib/storefront-bff.ts`, widen the sourcing payload and add three thread helpers:
```typescript
export async function proxySourcingSearch(payload: {
  query: string
  chat_history?: unknown[]
  thread_id?: string
}) {
  return storefrontBffFetch('/sourcing/search', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function proxyListSourcingThreads() {
  return storefrontBffFetch('/sourcing/threads', { method: 'GET' })
}

export async function proxyGetSourcingThread(id: string) {
  return storefrontBffFetch(`/sourcing/threads/${encodeURIComponent(id)}`, { method: 'GET' })
}

export async function proxyDeleteSourcingThread(id: string) {
  return storefrontBffFetch(`/sourcing/threads/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
```
(Preserve the existing `proxySourcingSearch` error-envelope handling; only the payload type changes. If `storefrontBffFetch` currently hard-codes POST/JSON, ensure it honours `init.method`/absence of a body for GET/DELETE — it already spreads `init`.)

- [ ] **Step 2: Threads list route**

Create `src/app/api/sourcing/threads/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { proxyListSourcingThreads } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await proxyListSourcingThreads()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ threads: [] })
  }
}
```

- [ ] **Step 3: Single-thread route**

Create `src/app/api/sourcing/threads/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { proxyGetSourcingThread, proxyDeleteSourcingThread } from '@/lib/storefront-bff'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await proxyGetSourcingThread(id)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ thread: null }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await proxyDeleteSourcingThread(id)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ deleted: false })
  }
}
```
(If this Next version types route context params synchronously — `{ params }: { params: { id: string } }` — use that instead of the `Promise` form; match the signature used elsewhere in `src/app/api/`.)

- [ ] **Step 4: Typecheck**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "sourcing/threads|storefront-bff" | head
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/lib/storefront-bff.ts src/app/api/sourcing/threads/route.ts src/app/api/sourcing/threads/[id]/route.ts
git commit -m "sourcing: storefront thread proxy routes (list/get/delete)"
```

### Task 4.2: storefront — `/api/sourcing` passes `thread_id`; response carries `thread_id`/`personalization`

**Files:**
- Modify: `b2c-marketplace-storefront/src/app/api/sourcing/route.ts`

**Interfaces:**
- Consumes: `proxySourcingSearch` (Task 4.1).
- Produces: forwards `{ query, chat_history?, thread_id? }`; returns the backend `data` unchanged (now possibly incl. `thread_id`, `personalization`).

- [ ] **Step 1: Forward `thread_id`**

In `src/app/api/sourcing/route.ts`, widen the parsed body type and pass `thread_id` through:
```typescript
  let body: {
    query?: string
    chat_history?: { role: string; content: string }[]
    thread_id?: string
  } = {}
```
and:
```typescript
    const data = await proxySourcingSearch({
      query,
      chat_history: body.chat_history,
      thread_id: body.thread_id,
    })
```
(Keep the existing empty-query guard and the catch-all error result.)

- [ ] **Step 2: Typecheck + commit**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "api/sourcing/route" | head   # expect no output
git add src/app/api/sourcing/route.ts
git commit -m "sourcing: forward thread_id through the sourcing proxy"
```

### Task 4.3: storefront — `SourcingWorkspace` uses the server thread when logged in

**Files:**
- Modify: `b2c-marketplace-storefront/src/components/sections/SourcingWorkspace/SourcingWorkspace.tsx`
- Modify: `b2c-marketplace-storefront/src/lib/sourcing-history.ts` (add server-thread types only; keep localStorage API intact)

**Interfaces:**
- Consumes: `/api/sourcing` (returns `thread_id`), `/api/sourcing/threads/[id]` (GET → `{ thread }`).
- Produces: when a search response carries `thread_id`, the workspace tracks it (state + `?thread=` URL) and continues that server thread on follow-ups; it does **not** write those turns to `localStorage`. When no `thread_id` (anonymous), behaviour is exactly today (localStorage).

**Design note:** the response shape decides the mode — `thread_id` present ⇒ server-backed (logged-in); absent ⇒ localStorage (anonymous). No extra "am I logged in?" call is needed in the component.

- [ ] **Step 1: Extend `SourcingResult` type**

In `SourcingWorkspace.tsx`, add optional fields to the `SourcingResult` type:
```typescript
  thread_id?: string
  personalization?: { company_name: string; sector: string; applied: string[] }
```
And to the `CatalogPick` type used by `CatalogCard`, add:
```typescript
  match_reasons?: string[]
```

- [ ] **Step 2: Send `thread_id`; adopt the returned one; skip localStorage when server-backed**

In `runSearch(query)`:
- Include the current thread id in the request body:
```typescript
      body: JSON.stringify({ query: q, chat_history: priorHistory, thread_id: threadId ?? undefined }),
```
- After `const data: SourcingResult = await res.json()`, adopt a server thread id when present:
```typescript
      const serverThreadId = data.thread_id
      if (serverThreadId && serverThreadId !== threadId) {
        setThreadId(serverThreadId)
        // reflect it in the URL without a navigation
        const url = new URL(window.location.href)
        url.searchParams.set('thread', serverThreadId)
        window.history.replaceState(null, '', url.toString())
      }
```
- In the `setMessages(...)` updater that appends the completed assistant turn, only persist to localStorage when the turn is NOT server-backed:
```typescript
        const isServerBacked = Boolean(serverThreadId)
        if (!isServerBacked) {
          persistConversation(activeThreadId!, activeTitle, completed, activeCreatedAt)
        }
        return completed
```
(Leave the pending/error branches persisting to localStorage only when `!serverThreadId`, mirroring this guard.)

- [ ] **Step 3: Load a server thread when `?thread=` points at one**

The mount effect currently calls `getSourcingThread(threadParam)` (localStorage). Make it try the server first, fall back to localStorage:
```typescript
  useEffect(() => {
    if (!threadParam) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/sourcing/threads/${encodeURIComponent(threadParam)}`, { cache: 'no-store' })
        if (res.ok) {
          const { thread } = await res.json()
          if (!cancelled && thread) {
            setThreadId(thread.id)
            setThreadTitle(thread.title || '')
            setMessages(
              (thread.messages || []).map((m: { role: 'user' | 'assistant'; content: string; result?: Record<string, unknown> }) =>
                m.role === 'assistant'
                  ? { role: 'assistant', content: m.content || '', result: m.result as SourcingResult | undefined }
                  : { role: 'user', content: m.content || '' }
              )
            )
            return
          }
        }
      } catch {
        // fall through to localStorage
      }
      if (cancelled) return
      const local = getSourcingThread(threadParam)   // existing localStorage path
      if (local) {
        setThreadId(local.id)
        setThreadTitle(local.title)
        setMessages(local.messages as Message[])
        setThreadCreatedAt(local.createdAt)
      }
    })()
    return () => { cancelled = true }
  }, [threadParam])
```
(Adapt to the existing effect's exact setters/vars; the key change is: try `GET /api/sourcing/threads/:id` first, keep the localStorage load as fallback.)

- [ ] **Step 4: Typecheck + manual verify**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "SourcingWorkspace" | head   # expect no output
```
Then in the browser (logged-in buyer, `localhost:3000`, `/pl/sourcing`): run a query → the URL gains `?thread=<id>`; reload → the thread reloads from the server; a follow-up continues the same thread; open the app in a second browser profile logged in as the same buyer → the thread is visible. Logged out: no `?thread=` server id appears, `localStorage` still drives Recent (Task 4.4).

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/sections/SourcingWorkspace/SourcingWorkspace.tsx src/lib/sourcing-history.ts
git commit -m "sourcing: SourcingWorkspace continues server-side threads when logged in"
```

### Task 4.4: storefront — Recent lists from the server (with anonymous localStorage fallback)

**Files:**
- Modify: `b2c-marketplace-storefront/src/components/sections/UserAccountDashboard/UserRecentSourcing.tsx`
- Modify: `b2c-marketplace-storefront/src/components/sections/SourcingAppShell/SourcingAppShell.tsx`

**Interfaces:**
- Consumes: `/api/sourcing/threads` (GET → `{ threads: [{ id, title, lastQuery, updatedAt }] }`).
- Produces: both Recent surfaces show server threads when the fetch returns any; otherwise they fall back to `listSourcingThreads()` (localStorage), preserving today's anonymous behaviour. Deletions call `DELETE /api/sourcing/threads/:id` for server threads.

- [ ] **Step 1: `UserRecentSourcing` — prefer server threads**

Replace the localStorage-only `refreshThreads` with a server-first load, keeping the `SOURCING_HISTORY_EVENT` subscription as the localStorage fallback trigger:
```typescript
  const [threads, setThreads] = useState<Array<{ id: string; title: string; updatedAt: number | string }>>([])

  const refreshThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/sourcing/threads', { cache: 'no-store' })
      if (res.ok) {
        const { threads: server } = await res.json()
        if (Array.isArray(server) && server.length) {
          setThreads(server.slice(0, 5).map((t: { id: string; title: string; updatedAt: string }) => ({
            id: t.id, title: t.title, updatedAt: t.updatedAt,
          })))
          return
        }
      }
    } catch {
      // fall through to localStorage
    }
    setThreads(listSourcingThreads().slice(0, 5))
  }, [])

  useEffect(() => {
    refreshThreads()
    const onEvt = () => refreshThreads()
    window.addEventListener(SOURCING_HISTORY_EVENT, onEvt)
    return () => window.removeEventListener(SOURCING_HISTORY_EVENT, onEvt)
  }, [refreshThreads])
```
(Keep the existing render/link `/sourcing?thread=${thread.id}`; `updatedAt` may now be an ISO string — format defensively if the component currently assumes a number.)

- [ ] **Step 2: `SourcingAppShell` — same server-first pattern for its thread list**

Apply the same server-first-then-localStorage load in `SourcingAppShell.tsx` where it calls `setThreads(listSourcingThreads())`. For its delete action, when the thread id came from the server, call `DELETE /api/sourcing/threads/:id` and then re-run the loader; otherwise use the existing `deleteSourcingThread(id)` localStorage path. (Distinguish by source: server threads come from the fetch branch — track a `serverBacked` boolean in the loaded state, or attempt the server delete first and fall back.)

- [ ] **Step 3: Typecheck + manual verify**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "UserRecentSourcing|SourcingAppShell" | head   # expect no output
```
Browser: logged-in buyer sees server threads in both the dashboard Recent card and the sourcing app shell; deleting removes them server-side (verify via `GET /sourcing/threads`); logged-out still shows localStorage threads.

- [ ] **Step 4: Commit**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/sections/UserAccountDashboard/UserRecentSourcing.tsx src/components/sections/SourcingAppShell/SourcingAppShell.tsx
git commit -m "sourcing: Recent lists read server threads (localStorage fallback for anonymous)"
```

### Task 4.5: storefront — personalization UI (banner, match badges, context panel, sector prompts)

**Files:**
- Modify: `b2c-marketplace-storefront/src/components/sections/SourcingWorkspace/SourcingWorkspace.tsx`
- Modify: `b2c-marketplace-storefront/src/components/sections/SourcingWorkspace/constants.ts`

**Interfaces:**
- Consumes: `result.personalization { company_name, sector, applied[] }`, `pick.match_reasons[]` (Task 1/1b contract, surfaced through Phase 3).
- Produces: a "Personalised for {company}" banner + collapsible context on personalized answers; match badges on `CatalogCard`; sector-relevant quick prompts prepended when `sector` is known.

- [ ] **Step 1: Personalization banner + context panel in `AssistantBlock`**

In the assistant renderer, when `r.personalization` is present, render above the answer:
```tsx
{r.personalization?.company_name ? (
  <div className="mb-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
    <p className="font-medium">Personalised for {r.personalization.company_name}</p>
    {r.personalization.applied?.length ? (
      <details className="mt-1 text-tertiary">
        <summary className="cursor-pointer select-none">Your sourcing context</summary>
        <ul className="mt-1 list-disc pl-4">
          {r.personalization.sector ? <li>Sector: {r.personalization.sector}</li> : null}
          {r.personalization.applied.map((a) => (
            <li key={a}>{a.replace(/_/g, ' ')}</li>
          ))}
        </ul>
      </details>
    ) : null}
  </div>
) : null}
```
(Use the project's existing token classes — match the surrounding cards; the above is indicative. Keep it invisible when `personalization` is absent = anonymous parity.)

- [ ] **Step 2: Match badges on `CatalogCard`**

In the inline `CatalogCard` component, render `pick.match_reasons` as small chips under the title:
```tsx
{Array.isArray(pick.match_reasons) && pick.match_reasons.length ? (
  <div className="mt-1 flex flex-wrap gap-1">
    {pick.match_reasons.slice(0, 2).map((m) => (
      <span key={m} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
        {m}
      </span>
    ))}
  </div>
) : null}
```

- [ ] **Step 3: Sector-relevant quick prompts**

In `constants.ts`, add a sector→prompts map and a resolver:
```typescript
export const SECTOR_QUICK_PROMPTS: Record<string, string[]> = {
  'Consumer Goods': [
    'Recycled or bio-based packaging suppliers',
    'GRS-certified recycled textile suppliers',
  ],
  'Construction': [
    'Low-carbon cement and concrete suppliers',
    'FSC-certified timber suppliers',
  ],
  // extend as tenant sectors appear
}

export function quickPromptsForSector(sector?: string): string[] {
  if (sector && SECTOR_QUICK_PROMPTS[sector]) {
    return [...SECTOR_QUICK_PROMPTS[sector], ...QUICK_PROMPTS]
  }
  return QUICK_PROMPTS
}
```
In `SourcingWorkspace.tsx`, track the latest known sector (from the most recent `result.personalization?.sector`) in state and feed `quickPromptsForSector(sector)` to wherever `QUICK_PROMPTS` is currently rendered (the empty-state / prompt chips).

- [ ] **Step 4: Typecheck + manual verify**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "SourcingWorkspace|constants" | head   # expect no output
```
Browser (personalized buyer): banner shows the company; context panel lists sector + applied signals; catalog cards show match badges; sector prompts appear. Anonymous: none of these render; UI identical to today.

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/components/sections/SourcingWorkspace/SourcingWorkspace.tsx src/components/sections/SourcingWorkspace/constants.ts
git commit -m "sourcing: personalization UI (banner, context panel, match badges, sector prompts)"
```

---

## Phase 5 — End-to-end verification

**Deliverable:** confirm the full stack personalizes + persists for a logged-in tenant buyer, is generic + device-local for anonymous, and never errors on failure.

- [ ] **Step 1: Services + tenant data**

- Orchestrator running (`ANTHROPIC_API_KEY`, `WEAVIATE_*`, `MONGODB_URI`), reachable at `AI_ORCHESTRATOR_API_URL`. tese-backend, marketplace backend, storefront running.
- Identify/seed a buyer whose **tese-SSO auth identity** maps to a tenant with `industry`/`sector`/`sustainability_goals`. Confirm the tenant doc:
  `mongosh "$MONGODB_URI" --eval 'db.tenant.findOne({}, {company_name:1, industry:1, sector:1, sustainability_goals:1})'`
  and a `user_tenant_v2` row links that tese user to it. (The trusted user id comes from the tese-SSO provider identity, not `customer.metadata` — verify `GET /store/tese-identity` returns it, Task 2.1 Step 3.)

- [ ] **Step 2: Personalized + session (authenticated)**

With BFF key + a customer bearer:
```bash
# turn 1 — creates a thread
curl -s -X POST "$TESE_BACKEND/api/v3/storefront/sourcing/search" \
  -H "Content-Type: application/json" -H "x-storefront-bff-key: $STOREFRONT_BFF_API_KEY" \
  -H "Authorization: Bearer <CUSTOMER_JWT>" \
  -d '{"query":"recycled polyester yarn"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('thread:',d.get('thread_id'));print('personalization:',d.get('personalization'));print('picks:',[(p.get('handle'),p.get('match_reasons')) for p in d.get('catalog_picks',[])][:3])"
```
Expected: a `thread_id`; `personalization={company_name, sector, applied:[...]}`; brief references the tenant's sector/goals. Then a follow-up on the same thread:
```bash
curl -s -X POST "$TESE_BACKEND/api/v3/storefront/sourcing/search" \
  -H "Content-Type: application/json" -H "x-storefront-bff-key: $STOREFRONT_BFF_API_KEY" \
  -H "Authorization: Bearer <CUSTOMER_JWT>" \
  -d '{"query":"which of those has the lowest MOQ?","thread_id":"<THREAD_ID>"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('answer')[:200])"
```
Expected: the answer resolves "those" against turn 1 (server-side history worked). Confirm persistence: `GET /api/v3/storefront/sourcing/threads` lists the thread; `GET /sourcing/threads/<id>` returns both turns.

- [ ] **Step 3: Storefront browser (logged-in)**

`/pl/sourcing` as the tenant buyer → banner "Personalised for {Company}", match badges, context panel, sector quick-prompts; URL gains `?thread=`; reload reloads from server; Recent card + app shell list the server thread; a second logged-in session sees the same thread.

- [ ] **Step 4: Anonymous parity**

Logged out: run the same query → response has **no** `thread_id`, **no** `personalization`; UI shows no banner/badges; Recent still driven by `localStorage`; the request/response shape matches today.

- [ ] **Step 5: Failure fallback**

Break each hop in turn and confirm a normal generic result (never a user-facing error): (a) marketplace `/store/tese-identity` down → `fetchTeseIdentity` returns null → no tenant, no personalization, but the thread still persists; (b) invalid/unknown tenant → generic brief; (c) Mongo write failing → search still returns (best-effort `appendTurn`); (d) orchestrator personalization internals failing → base sourcing result.

- [ ] **Step 6: Privacy check**

In a dev orchestrator run, log/inspect the Claude user prompt for a personalized turn — confirm it contains ONLY the acting tenant's data (company/sector/goals/own facts), no other tenant's data, no financials.

- [ ] **Step 7: Record results in the SDD ledger** (no code commit).

---

## Self-Review

**Spec coverage (design spec L1–L3 + sessions):**
- L1 identity pipeline → Phase 2 (trusted `getTrustedTeseUserId` via `/store/tese-identity` + `fetchTeseIdentity`), Phase 3 Task 3.3 (`_resolvePrimaryTenantId`, primary membership). ✓ (and the spec's `customer.metadata.tese_user_id` read is intentionally replaced by the trusted path — see below.)
- L2 orchestrator personalization (structured profile + `TenantSelfIntelligence` semantic + boost + prompt + `personalization`/`match_reasons`) → Phase 1 (backend-plan Tasks 1–3) + Task 1b (`sector`). ✓
- L3 UI (greet by company, match badges, context panel, sector quick-prompts) → Task 4.5. ✓
- Persistent sessions (new, beyond the original spec) → Phase 3 (model/service/routes) + Phase 4.1–4.4 (storefront server threads). ✓
- Best-effort / anonymous parity → Phase 3 Task 3.3 (thread only when authenticated; `chat_history` fallback), Phase 5 Steps 4–5. ✓
- Privacy (own tenant only, tenant-scoped Weaviate, `medusaCustomerId` scoping on every thread read/write) → Phase 1 Task 2 (`_bounded_search` `.with_tenant`), Phase 3 (scoped queries), Phase 5 Step 6. ✓
- Multi-tenant primary rule → Phase 3 Task 3.3. ✓

**Intentional deviations from the design spec (better):**
1. **Trusted identity, not `customer.metadata`.** The spec's Layer 1 read `customer.metadata.tese_user_id` in the storefront. Store customers can write their own metadata → a forged value would leak another tenant's personalization. This plan derives the id server-side from the tese-SSO auth identity (`getTrustedTeseUserId`), the same fix already applied to Matrix. This drops the original backend plan's Task 5.
2. **Reuse `TenantSummary`/`get_tenant`/`_project_tenant_summary`, not `get_project_context`** (which needs polygon/location/activities a buyer lacks). Inherited from the backend plan.
3. **Server-side sessions** are an addition to the spec, per the "maximize personalization" decision — the persistent thread is the carrier that makes personalization account-wide and durable.

**Placeholder scan:** none — full code/tests/commands for every new file. The "adapt to the existing effect/vars" notes in Phase 4 are explicit integration instructions against a mapped component (exact setters/state from the research), with a concrete fallback (localStorage), not TODOs.

**Type consistency:** `Personalization{company_name, sector, applied}` (Task 1/1b) → surfaced by tese-backend inside `data` (Task 3.3) → typed in `SourcingResult` (Task 4.3) → rendered (Task 4.5). `thread_id: str` set in Task 3.3 → forwarded Task 4.2 → consumed Task 4.3. `SourcingThread` fields (Task 3.1) match the service reads/writes (Task 3.2) and the route serializer (Task 3.4). `runSourcingSearch({query, chat_history, tenant_id})` (Task 3.1 sourcingService) matches the Task 3.3 call. `fetchTeseIdentity` (Task 2.2) matches the Task 3.3 import. `GET /store/tese-identity` response `{ tese_user_id }` (Task 2.1) matches `fetchTeseIdentity`'s read (Task 2.2).
