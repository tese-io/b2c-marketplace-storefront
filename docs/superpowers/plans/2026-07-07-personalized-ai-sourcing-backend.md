# Personalized AI Sourcing — Backend (L1 + L2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When a logged-in marketplace buyer resolves to a tese tenant, personalize the AI sourcing brief, catalogue ranking, and add a personalization signal to the response — using the tenant's profile (Mongo) + own knowledge (Weaviate `TenantSelfIntelligence`) — while the anonymous path stays byte-for-byte identical.

**Architecture:** Three-hop, best-effort. Storefront `/api/sourcing` forwards the customer's `tese_user_id`; tese-backend `_sourcingSearch` resolves it to a `tenant_id` (primary membership) and passes it to the orchestrator; the orchestrator's `run_sourcing`, when `tenant_id` is present, loads a `TenantSummary` from Mongo + retrieves tenant facts from the tenant-scoped `TenantSelfIntelligence` collection, injects a tenant block into the Claude prompt, lightly boosts matching candidates, and returns a `personalization` object plus per-pick `match_reasons`. Any failure falls back to the generic result.

**Tech Stack:** Python 3 / FastAPI / Pydantic v2 / Weaviate v4 / pytest (orchestrator); Node/Express/Mongoose (tese-backend); Next.js App Router (storefront proxy only — no UI in this plan).

**Spec:** `docs/superpowers/specs/2026-07-07-personalized-ai-sourcing-design.md`. This plan covers Layers 1 and 2 only; the storefront UI (Layer 3) is a separate plan built on the response contract below.

## Global Constraints

- **Best-effort & anonymous parity:** personalization is strictly additive. No `tese_user_id` → no `tenant_id` → the orchestrator request/response are exactly today's. Any resolve/load/query failure returns the generic result — never a 4xx/5xx to the user for a personalization failure.
- **Privacy:** inject only the acting tenant's own sourcing-relevant fields (company_name, industry, sector, sustainability_goals, plus retrieved `TenantSelfIntelligence` summaries). Never another tenant's data; never raw financials. Catalogue retrieval stays global.
- **Multi-tenant:** use the buyer's **primary** membership — the `UserTenantV2` row with `organization_admin: true`, else the most recent. No switcher.
- **Weaviate `TenantSelfIntelligence` is multi-tenancy-enabled** — every query MUST be tenant-scoped via `.with_tenant(tenant_id)`. Reuse `query_processor/common/weaviate_queries.py` (`hybrid_search` / `_bounded_search`), which already enforce this.
- **Do NOT** use `marketplace_recommend/context.get_project_context()` (it requires `location_id`/`polygon_id`/`activity_tags`). Reuse its tenant internals only (`get_tenant`, `_project_tenant_summary`, `TenantSummary`).
- **No new dependencies** in any repo.
- **Response contract (new, all optional):** `SourcingResponse.personalization: { company_name: str, applied: list[str] } | None`; `CatalogPick.match_reasons: list[str]` (default `[]`).
- **Commit scoping:** several repos have unrelated uncommitted WIP (the storefront inbox redesign; tese-marketplace-backend connect plugin). Commit ONLY this task's files by explicit path; never `git add -A`.
- **Orchestrator run/test:** tests live in `ai-orchestrator-api/tests/` (root), `pytest.ini` sets `asyncio_mode=auto`, `testpaths=tests`. Run one test: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_x.py -v`. The API runs on port 8000 by default; tese-backend defaults `AI_ORCHESTRATOR_API_URL=http://localhost:8002`, so to smoke-test against a running backend either start the orchestrator with `PORT=8002` or point the backend at `:8000`.
- **Staging identities:** buyer `matrix-test@tese.io` / `secret123`. For a positive personalization test you need a buyer whose Medusa customer has `metadata.tese_user_id` set to a tese user that belongs to a tenant with `industry`/`sector`/`sustainability_goals` populated (see Task 6 verification for how to confirm/seed).

---

### Task 1: Orchestrator — extend sourcing schemas (request `tenant_id`, response `personalization`, pick `match_reasons`)

**Files:**
- Modify: `ai-orchestrator-api/query_processor/workflows/sourcing/schemas.py`
- Test: `ai-orchestrator-api/tests/unit/sourcing/test_schemas.py` (create; also create `tests/unit/sourcing/__init__.py` if the package dirs don't exist)

**Interfaces:**
- Produces: `SourcingRequest.tenant_id: Optional[str]`; `CatalogPick.match_reasons: List[str]`; new `Personalization(BaseModel){ company_name: str; applied: List[str] }`; `SourcingResponse.personalization: Optional[Personalization]`.

- [ ] **Step 1: Write the failing test**

Create `ai-orchestrator-api/tests/unit/sourcing/__init__.py` (empty) and `ai-orchestrator-api/tests/unit/sourcing/test_schemas.py`:

```python
from query_processor.workflows.sourcing.schemas import (
    SourcingRequest,
    SourcingResponse,
    CatalogPick,
    Personalization,
)


def test_request_accepts_optional_tenant_id():
    r = SourcingRequest(query="rPET flakes")
    assert r.tenant_id is None
    r2 = SourcingRequest(query="rPET flakes", tenant_id="507f1f77bcf86cd799439011")
    assert r2.tenant_id == "507f1f77bcf86cd799439011"


def test_pick_has_match_reasons_default_empty():
    p = CatalogPick(handle="rpet-flakes")
    assert p.match_reasons == []
    p2 = CatalogPick(handle="rpet-flakes", reason="fits", match_reasons=["Matches your GOTS cert"])
    assert p2.match_reasons == ["Matches your GOTS cert"]


def test_response_personalization_optional():
    resp = SourcingResponse()
    assert resp.personalization is None
    resp2 = SourcingResponse(personalization=Personalization(company_name="Acme", applied=["sector"]))
    assert resp2.personalization.company_name == "Acme"
    assert resp2.personalization.applied == ["sector"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_schemas.py -v`
Expected: FAIL — `ImportError: cannot import name 'Personalization'` (and `tenant_id`/`match_reasons` missing).

- [ ] **Step 3: Edit `schemas.py`**

In `query_processor/workflows/sourcing/schemas.py`:

Add `tenant_id` to `SourcingRequest` (after `max_web`):
```python
    tenant_id: Optional[str] = None
```

Add `match_reasons` to `CatalogPick`:
```python
class CatalogPick(BaseModel):
    model_config = ConfigDict(extra="ignore")
    handle: str
    reason: str = ""
    match_reasons: List[str] = Field(default_factory=list)
```

Add a `Personalization` model (place it just above `SourcingResponse`):
```python
class Personalization(BaseModel):
    model_config = ConfigDict(extra="ignore")
    company_name: str = ""
    applied: List[str] = Field(default_factory=list)
```

Add the field to `SourcingResponse` (after `meta`):
```python
    personalization: Optional[Personalization] = None
```

(`Optional`, `List`, `Field`, `ConfigDict`, `BaseModel` are already imported at the top of the file.)

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_schemas.py -v`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/tese/ai-orchestrator-api
git add query_processor/workflows/sourcing/schemas.py tests/unit/sourcing/__init__.py tests/unit/sourcing/test_schemas.py
git commit -m "sourcing: add tenant_id / personalization / match_reasons to schemas"
```

---

### Task 2: Orchestrator — sourcing personalization module (tenant summary + tenant-fact retrieval + prompt block + candidate boost)

**Files:**
- Create: `ai-orchestrator-api/query_processor/workflows/sourcing/personalization.py`
- Test: `ai-orchestrator-api/tests/unit/sourcing/test_personalization.py`

**Interfaces:**
- Consumes: `TenantSummary`, `_project_tenant_summary`, `get_tenant` from `query_processor/workflows/marketplace_recommend/context.py`; `_bounded_search` from `query_processor/common/weaviate_queries.py`; `CatalogCandidate`, `Personalization` from sourcing schemas.
- Produces:
  - `load_tenant_summary(tenant_id: str, db=None) -> Optional[TenantSummary]`
  - `retrieve_tenant_facts(tenant_id: str, query: str, *, limit: int = 6) -> List[str]`
  - `build_tenant_block(summary: TenantSummary, facts: List[str]) -> str`
  - `boost_candidates(candidates: List[CatalogCandidate], summary: TenantSummary) -> List[CatalogCandidate]`
  - `applied_signals(summary: TenantSummary, facts: List[str]) -> List[str]`

- [ ] **Step 1: Write the failing test**

Create `ai-orchestrator-api/tests/unit/sourcing/test_personalization.py`:

```python
from unittest.mock import patch, MagicMock

from query_processor.workflows.marketplace_recommend.schemas import TenantSummary
from query_processor.workflows.sourcing.schemas import CatalogCandidate
from query_processor.workflows.sourcing import personalization as P


def _summary(**kw):
    base = dict(id="t1", company_name="Acme Textiles", industry="Apparel",
                sector="Consumer Goods", sustainability_goals=["30% recycled content by 2027"])
    base.update(kw)
    return TenantSummary(**base)


def test_build_tenant_block_includes_key_fields():
    block = P.build_tenant_block(_summary(), ["Target: 30% recycled polyester by 2027"])
    assert "Acme Textiles" in block
    assert "Apparel" in block
    assert "Consumer Goods" in block
    assert "30% recycled content by 2027" in block
    assert "30% recycled polyester by 2027" in block  # a retrieved fact


def test_applied_signals_reports_what_was_used():
    sig = P.applied_signals(_summary(), ["fact"])
    assert "sector" in sig and "sustainability_goals" in sig and "tenant_knowledge" in sig
    sig_empty = P.applied_signals(_summary(sector=None, sustainability_goals=[]), [])
    assert "sector" not in sig_empty and "sustainability_goals" not in sig_empty


def test_boost_candidates_prioritises_industry_overlap():
    a = CatalogCandidate(handle="a", title="Recycled apparel yarn",
                         category="Apparel", metadata={})
    b = CatalogCandidate(handle="b", title="Steel beams", category="Construction", metadata={})
    ordered = P.boost_candidates([b, a], _summary())
    assert [c.handle for c in ordered][0] == "a"  # apparel match floats up
    # non-destructive: same set of handles
    assert {c.handle for c in ordered} == {"a", "b"}


def test_retrieve_tenant_facts_scopes_by_tenant_and_maps_summaries():
    fake_obj = MagicMock()
    fake_obj.properties = {"summary": "Target: 30% recycled polyester by 2027", "content_plain": ""}
    fake_resp = MagicMock()
    fake_resp.objects = [fake_obj]
    with patch.object(P, "_bounded_search", return_value=fake_resp) as m:
        facts = P.retrieve_tenant_facts("t1", "recycled polyester", limit=6)
    assert facts == ["Target: 30% recycled polyester by 2027"]
    # tenant_id passed through to the tenant-scoped search
    assert m.call_args.kwargs.get("tenant_id") == "t1"


def test_load_tenant_summary_returns_none_on_missing():
    with patch.object(P, "get_tenant", return_value=None):
        assert P.load_tenant_summary("nope", db=MagicMock()) is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_personalization.py -v`
Expected: FAIL — `ModuleNotFoundError: ...sourcing.personalization`.

- [ ] **Step 3: Create `personalization.py`**

Create `ai-orchestrator-api/query_processor/workflows/sourcing/personalization.py`:

```python
"""Tenant personalization for AI sourcing (best-effort, additive).

Loads a tenant's profile (Mongo) and own-knowledge facts (Weaviate
TenantSelfIntelligence, tenant-scoped) and turns them into a prompt block +
a light candidate re-rank. Every function is defensive: on any failure it
degrades to "no personalization" so the base sourcing flow is never broken.
"""
from __future__ import annotations

import logging
from typing import Any, List, Optional

from query_processor.common.weaviate_queries import _bounded_search
from query_processor.workflows.marketplace_recommend.context import (
    get_tenant,
    _project_tenant_summary,
)
from query_processor.workflows.marketplace_recommend.schemas import TenantSummary
from query_processor.workflows.sourcing.schemas import CatalogCandidate

logger = logging.getLogger(__name__)

_TI_COLLECTION = "TenantSelfIntelligence"
# Categories worth grounding a sourcing brief in.
_TI_CATEGORIES = ["profile", "goals", "esg", "climate_nature"]


def load_tenant_summary(tenant_id: str, db: Optional[Any] = None) -> Optional[TenantSummary]:
    """Return a TenantSummary for tenant_id, or None if missing/on error."""
    try:
        doc = get_tenant(tenant_id, db=db)
        if not doc:
            return None
        return _project_tenant_summary(doc)
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("sourcing personalization: tenant summary load failed: %s", exc)
        return None


def retrieve_tenant_facts(tenant_id: str, query: str, *, limit: int = 6) -> List[str]:
    """Tenant-scoped TenantSelfIntelligence hybrid search → short fact strings."""
    if not tenant_id or not query:
        return []
    try:
        from weaviate.classes.query import Filter

        resp = _bounded_search(
            collection_name=_TI_COLLECTION,
            query_text=query,
            alpha=0.55,
            desired_limit=limit,
            filters_obj=Filter.by_property("data_category").contains_any(_TI_CATEGORIES),
            tenant_id=tenant_id,
        )
        facts: List[str] = []
        for obj in getattr(resp, "objects", []) or []:
            props = getattr(obj, "properties", {}) or {}
            text = (props.get("summary") or props.get("content_plain") or props.get("content") or "").strip()
            if text:
                facts.append(text[:280])
        return facts[:limit]
    except Exception as exc:  # pragma: no cover - defensive
        logger.warning("sourcing personalization: tenant fact retrieval failed: %s", exc)
        return []


def applied_signals(summary: TenantSummary, facts: List[str]) -> List[str]:
    applied: List[str] = []
    if summary.industry:
        applied.append("industry")
    if summary.sector:
        applied.append("sector")
    if summary.sustainability_goals:
        applied.append("sustainability_goals")
    if facts:
        applied.append("tenant_knowledge")
    return applied


def build_tenant_block(summary: TenantSummary, facts: List[str]) -> str:
    lines = ["BUYER COMPANY CONTEXT (personalize the brief and explain fit; do not invent):"]
    lines.append(f"- Company: {summary.company_name}")
    if summary.industry:
        lines.append(f"- Industry: {summary.industry}")
    if summary.sector:
        lines.append(f"- Sector: {summary.sector}")
    if summary.sustainability_goals:
        goals = "; ".join(summary.sustainability_goals[:5])
        lines.append(f"- Sustainability goals: {goals}")
    if facts:
        lines.append("- Relevant facts from the company's own data:")
        for f in facts[:6]:
            lines.append(f"  * {f}")
    lines.append(
        "When a catalog pick fits this company's sector/goals/certifications, add a short "
        "match_reasons array (max 2 strings) to that pick explaining why."
    )
    return "\n".join(lines)


def _tenant_tokens(summary: TenantSummary) -> set:
    toks = set()
    for v in (summary.industry, summary.sector):
        if v:
            toks.add(str(v).strip().lower())
    return toks


def boost_candidates(
    candidates: List[CatalogCandidate], summary: TenantSummary
) -> List[CatalogCandidate]:
    """Stable re-rank: candidates whose category/title overlap the tenant's
    industry/sector float up. Non-destructive (same set, order changed)."""
    toks = _tenant_tokens(summary)
    if not toks or not candidates:
        return list(candidates)

    def score(c: CatalogCandidate) -> int:
        hay = f"{c.category or ''} {c.title or ''}".lower()
        return 1 if any(t in hay for t in toks) else 0

    # stable sort: matches first, original order preserved within groups
    return sorted(candidates, key=lambda c: -score(c))
```

Note on `get_tenant` signature: it is defined in `context.py` and used there as `get_tenant(tenant_id, db=...)`. If your local signature differs, adapt the two call sites in `load_tenant_summary` (the only place it's used) — do not change `context.py`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_personalization.py -v`
Expected: PASS (5 passed). If `get_tenant`/`_project_tenant_summary` aren't importable by those names, open `context.py`, find the actual tenant-doc loader + `TenantSummary` projector, and import those instead; keep function behavior identical.

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/tese/ai-orchestrator-api
git add query_processor/workflows/sourcing/personalization.py tests/unit/sourcing/test_personalization.py
git commit -m "sourcing: tenant personalization module (summary, facts, prompt block, boost)"
```

---

### Task 3: Orchestrator — wire personalization into `run_sourcing`

**Files:**
- Modify: `ai-orchestrator-api/query_processor/workflows/sourcing/engine.py`
- Test: `ai-orchestrator-api/tests/unit/sourcing/test_engine_personalization.py`

**Interfaces:**
- Consumes: Task 2 functions; `Personalization` (Task 1).
- Produces: `run_sourcing(req)` behavior — when `req.tenant_id` set and a summary loads, the Claude user prompt includes the tenant block, the response carries `personalization`, and `catalog_picks[].match_reasons` are preserved from the model JSON.

- [ ] **Step 1: Write the failing test**

Create `ai-orchestrator-api/tests/unit/sourcing/test_engine_personalization.py`:

```python
import json
from unittest.mock import patch, MagicMock

import pytest

from query_processor.workflows.marketplace_recommend.schemas import TenantSummary
from query_processor.workflows.sourcing.schemas import SourcingRequest, CatalogCandidate
from query_processor.workflows.sourcing import engine


def _claude_json():
    return {
        "text": json.dumps({
            "answer": "Here are options.",
            "catalog_picks": [{"handle": "rpet", "reason": "recycled", "match_reasons": ["Matches your recycled-content goal"]}],
            "suppliers": [],
            "follow_ups": [],
        }),
        "used_web_search": False,
        "model": "claude-sonnet-4-5",
    }


@pytest.mark.asyncio
async def test_personalized_run_injects_block_and_sets_personalization():
    req = SourcingRequest(
        query="recycled polyester",
        candidates=[CatalogCandidate(handle="rpet", title="Recycled polyester", category="Apparel")],
        tenant_id="t1",
        include_web=False,
    )
    summary = TenantSummary(id="t1", company_name="Acme Textiles", industry="Apparel",
                            sector="Consumer Goods", sustainability_goals=["30% recycled by 2027"])

    captured = {}

    def fake_invoke(system, user, *, include_web, max_searches):
        captured["user"] = user
        return _claude_json()

    with patch.object(engine, "_invoke_claude", side_effect=fake_invoke), \
         patch("query_processor.workflows.sourcing.engine.load_tenant_summary", return_value=summary), \
         patch("query_processor.workflows.sourcing.engine.retrieve_tenant_facts", return_value=["Target: 30% recycled by 2027"]):
        resp = await engine.run_sourcing(req)

    assert "Acme Textiles" in captured["user"]          # tenant block injected
    assert resp.personalization is not None
    assert resp.personalization.company_name == "Acme Textiles"
    assert "sector" in resp.personalization.applied
    assert resp.catalog_picks[0].match_reasons == ["Matches your recycled-content goal"]


@pytest.mark.asyncio
async def test_anonymous_run_has_no_personalization_and_no_block():
    req = SourcingRequest(query="recycled polyester",
                          candidates=[CatalogCandidate(handle="rpet", title="x")], include_web=False)
    captured = {}

    def fake_invoke(system, user, *, include_web, max_searches):
        captured["user"] = user
        return _claude_json()

    with patch.object(engine, "_invoke_claude", side_effect=fake_invoke), \
         patch("query_processor.workflows.sourcing.engine.load_tenant_summary") as load:
        resp = await engine.run_sourcing(req)

    load.assert_not_called()                              # no tenant_id → no load
    assert "BUYER COMPANY CONTEXT" not in captured["user"]
    assert resp.personalization is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/test_engine_personalization.py -v`
Expected: FAIL — engine doesn't import `load_tenant_summary`, doesn't set `personalization`, and `_coerce_picks` drops `match_reasons`.

- [ ] **Step 3: Edit `engine.py`**

(a) Add imports near the top (with the other workflow imports):
```python
from query_processor.workflows.sourcing.personalization import (
    load_tenant_summary,
    retrieve_tenant_facts,
    build_tenant_block,
    boost_candidates,
    applied_signals,
)
from query_processor.workflows.sourcing.schemas import Personalization
```

(b) In `_build_user_prompt(req)`, prepend the tenant block when present. At the START of the function, build an optional prefix and include it in the returned string. Concretely, change the function to accept the block; the simplest non-invasive edit — compute the block in `run_sourcing` and pass it in. Change the signature and its single call:

`_build_user_prompt` — add a param and prepend:
```python
def _build_user_prompt(req: "SourcingRequest", tenant_block: str = "") -> str:
    sections: List[str] = []
    if tenant_block:
        sections.append(tenant_block)
    # ... existing body that builds CONVERSATION SO FAR / BUYER SOURCING REQUEST /
    #     PLATFORM CATALOG CANDIDATES, appended to `sections` ...
    return "\n\n".join(sections)
```
(Adapt to the existing body: keep everything it already appends; just ensure `tenant_block` is the first section when non-empty. If the existing function returns a single joined string, wrap its current pieces into `sections` and prepend the block.)

(c) In `run_sourcing`, load personalization before building the prompt and set it on every return path. Replace the top of `run_sourcing` (through the prompt build) with:
```python
async def run_sourcing(req: SourcingRequest) -> SourcingResponse:
    started = time.perf_counter()
    valid_handles = {c.handle for c in req.candidates}

    personalization: Optional[Personalization] = None
    tenant_block = ""
    if req.tenant_id:
        summary = load_tenant_summary(req.tenant_id)
        if summary is not None:
            facts = retrieve_tenant_facts(req.tenant_id, req.query)
            tenant_block = build_tenant_block(summary, facts)
            req.candidates = boost_candidates(req.candidates, summary)
            personalization = Personalization(
                company_name=summary.company_name,
                applied=applied_signals(summary, facts),
            )

    system = SOURCING_SYSTEM
    user = _build_user_prompt(req, tenant_block)
    max_searches = req.max_web if req.include_web else 0
    # ... unchanged _invoke_claude call + parsing ...
```
Then add `personalization=personalization` to **every** `return SourcingResponse(...)` in the function (the error, partial, and ok branches). For the "ok" branch it's `SourcingResponse(status="ok", ..., meta=..., personalization=personalization)`.

(d) Preserve `match_reasons` in `_coerce_picks`. Find `_coerce_picks(raw, valid_handles)` and, where it constructs each `CatalogPick(handle=..., reason=...)`, also pass:
```python
CatalogPick(
    handle=h,
    reason=str(item.get("reason", "")).strip(),
    match_reasons=[str(x) for x in (item.get("match_reasons") or [])][:2],
)
```
(Keep the existing handle-validation against `valid_handles`.)

(e) `SOURCING_SYSTEM` already tells Claude to emit `catalog_picks: [{handle, reason}]`. Update that one line of the JSON contract in the system prompt to `[{handle, reason, match_reasons?}]` and add: "Include `match_reasons` (≤2 short strings) only when the pick fits the buyer company context."

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/ubuntu/tese/ai-orchestrator-api && python -m pytest tests/unit/sourcing/ -v`
Expected: PASS (all sourcing unit tests green, incl. Tasks 1–2).

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/tese/ai-orchestrator-api
git add query_processor/workflows/sourcing/engine.py tests/unit/sourcing/test_engine_personalization.py
git commit -m "sourcing: inject tenant context into run_sourcing + emit personalization/match_reasons"
```

---

### Task 4: tese-backend — resolve `tese_user_id → tenant_id` and forward it

**Files:**
- Modify: `tese-backend/controllers/v3/storefront/storefrontController.js` (`_sourcingSearch`)
- Modify: `tese-backend/services/v3/storefront/sourcingService.js` (`runSourcingSearch` + a small resolver)

**Interfaces:**
- Consumes: `models/v1/users/userTenantV2.js` (fields `user_id`, `tenant_id`, `organization_admin`, timestamps). The orchestrator `SourcingRequest.tenant_id` (Task 1).
- Produces: `runSourcingSearch({ query, chat_history, tenant_id })` forwards `tenant_id` in the orchestrator POST body.

- [ ] **Step 1: Add tenant resolution to `_sourcingSearch`**

This repo has no unit-test harness for these controllers (verify by running). In `controllers/v3/storefront/storefrontController.js`, at the top add the model import (with the other requires):
```javascript
const { UserTenantV2 } = require('../../../models/v1/users/userTenantV2')
```
(Confirm the export name/path — open `models/v1/users/userTenantV2.js`; adapt `{ UserTenantV2 }` vs default export to match.)

Add a resolver helper above `_sourcingSearch`:
```javascript
/**
 * Resolve a tese user id to their primary tenant id (org-admin first, else
 * most recent membership). Best-effort: returns null on any problem.
 */
async function _resolvePrimaryTenantId (teseUserId) {
  if (!teseUserId) return null
  try {
    const rows = await UserTenantV2.find({ user_id: teseUserId })
      .sort({ organization_admin: -1, updatedAt: -1 })
      .limit(1)
      .lean()
    return rows && rows[0] ? String(rows[0].tenant_id) : null
  } catch (err) {
    return null
  }
}
```

Update `_sourcingSearch` to read `tese_user_id`, resolve, and forward:
```javascript
async function _sourcingSearch (req, res) {
  try {
    const { query, chat_history, tese_user_id } = req.body || {}
    const tenant_id = await _resolvePrimaryTenantId(tese_user_id)
    const data = await runSourcingSearch({ query, chat_history, tenant_id })
    return res.status(200).json(data)
  } catch (err) {
    return res.status(200).json({
      status: 'error',
      answer: err?.message || 'Sourcing search failed',
      suppliers: [],
      catalog_picks: [],
      follow_ups: [],
      meta: {}
    })
  }
}
```

- [ ] **Step 2: Forward `tenant_id` from `runSourcingSearch`**

In `services/v3/storefront/sourcingService.js`, change the signature and the orchestrator POST body:
```javascript
async function runSourcingSearch ({ query, chat_history = [], tenant_id = null }) {
```
In the `axios.post(`${ORCHESTRATOR_URL}${SOURCING_PATH}`, { ... })` body, add `tenant_id` (only when set, to keep anonymous calls byte-identical):
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
(Preserve the existing hydration of `data.catalog_picks` and the returned shape — `personalization` and `match_reasons` pass through untouched inside `data`/each pick.)

- [ ] **Step 3: Verify (controller, running services)**

Restart tese-backend and the orchestrator. With a known `tese_user_id` that belongs to a tenant, POST the backend sourcing route directly (through the BFF key) and confirm the orchestrator receives `tenant_id` and the response carries `personalization`. Exact commands in Task 6.

- [ ] **Step 4: Commit**

```bash
cd /home/ubuntu/tese/tese-backend
git add controllers/v3/storefront/storefrontController.js services/v3/storefront/sourcingService.js
git commit -m "storefront sourcing: resolve tese_user_id -> primary tenant and forward to orchestrator"
```

---

### Task 5: storefront — forward the customer's `tese_user_id` to the sourcing proxy

**Files:**
- Modify: `b2c-marketplace-storefront/src/app/api/sourcing/route.ts`
- Modify: `b2c-marketplace-storefront/src/lib/storefront-bff.ts` (`proxySourcingSearch`)

**Interfaces:**
- Consumes: `retrieveCustomer()` (`@/lib/data/customer`) — returns the logged-in customer incl. `metadata`.
- Produces: the storefront sends `{ query, chat_history, tese_user_id? }` to tese-backend `/sourcing/search`.

- [ ] **Step 1: Read the customer's tese id in the sourcing route**

In `src/app/api/sourcing/route.ts`, import `retrieveCustomer` and read `metadata.tese_user_id` (best-effort; never block the search). In the `POST` handler, before calling `proxySourcingSearch`:
```typescript
import { retrieveCustomer } from '@/lib/data/customer'
// ...
  let teseUserId: string | undefined
  try {
    const customer = await retrieveCustomer()
    const v = (customer?.metadata as Record<string, unknown> | undefined)?.tese_user_id
    if (typeof v === 'string' && v) teseUserId = v
  } catch {
    // anonymous or fetch failed → no personalization
  }
  const result = await proxySourcingSearch({ query, chat_history, tese_user_id: teseUserId })
```
(Match the existing variable names in the handler — it already destructures `query`, `chat_history` and calls `proxySourcingSearch({ query, chat_history })`; just add `tese_user_id`.)

**Note on `retrieveCustomer` fields:** it fetches `/store/customers/me` with `query.fields = '*orders'`. If `customer.metadata` comes back undefined, add `metadata` to that fields string in `src/lib/data/customer.ts` (`fields: '*orders,+metadata'`) so `tese_user_id` is present. Verify in Task 6; adjust only if needed.

- [ ] **Step 2: Pass it through `proxySourcingSearch`**

In `src/lib/storefront-bff.ts`, widen `proxySourcingSearch` to accept and forward `tese_user_id`:
```typescript
export async function proxySourcingSearch(payload: {
  query: string
  chat_history?: unknown[]
  tese_user_id?: string
}) {
  return storefrontBffFetch('/sourcing/search', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
```
(Keep the existing return handling; just replace the body/param typing so `tese_user_id` is included when present.)

- [ ] **Step 3: Typecheck**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
npx tsc --noEmit 2>&1 | grep -E "api/sourcing/route|storefront-bff" | head
```
Expected: no output.

- [ ] **Step 4: Commit (scoped)**

```bash
cd /home/ubuntu/tese/b2c-marketplace-storefront
git add src/app/api/sourcing/route.ts src/lib/storefront-bff.ts
git commit -m "sourcing: forward the logged-in customer's tese_user_id to the backend"
```

(If Task 6 shows `metadata` isn't returned, also commit the one-line `src/lib/data/customer.ts` fields change with this task.)

---

### Task 6: End-to-end verification (controller)

**Deliverable:** confirm the full chain personalizes for a logged-in tenant buyer and is unchanged for anonymous.

- [ ] **Step 1: Ensure services + tenant data**

- Orchestrator running with `ANTHROPIC_API_KEY`, `WEAVIATE_*`, `MONGODB_URI` set, reachable at the URL tese-backend uses (`AI_ORCHESTRATOR_API_URL`). tese-backend + storefront running.
- Identify a buyer whose Medusa customer has `metadata.tese_user_id` set to a tese user in a tenant with `industry`/`sector`/`sustainability_goals`. Confirm the tese side in Mongo:
  `mongosh "$MONGODB_URI" --eval 'db.tenant.findOne({}, {company_name:1, industry:1, sector:1, sustainability_goals:1})'`
  and confirm a `user_tenant_v2` row links a user to it. If `matrix-test`'s customer has no `tese_user_id`, either use an SSO-provisioned buyer or seed `metadata.tese_user_id` on the test customer to a valid tese user id that has a membership.

- [ ] **Step 2: Backend direct (personalized)**

With the BFF key and a customer bearer token (or pass `tese_user_id` directly in the body for the direct backend test), POST the backend sourcing route and assert the response includes a `personalization` object:
```bash
curl -s -X POST "$TESE_BACKEND/api/v3/storefront/sourcing/search" \
  -H "Content-Type: application/json" -H "x-storefront-bff-key: $STOREFRONT_BFF_API_KEY" \
  -d '{"query":"recycled polyester yarn","tese_user_id":"<TESE_USER_ID>"}' \
  | python3 -c "import sys,json;d=json.load(sys.stdin);print('personalization:',d.get('personalization'));print('picks:',[(p.get('handle'),p.get('match_reasons')) for p in d.get('catalog_picks',[])][:3])"
```
Expected: `personalization` is `{company_name, applied:[...]}`; brief/answer references the tenant's sector/goals.

- [ ] **Step 3: Storefront end-to-end (browser, logged in)**

Log in as the tenant buyer, go to `/pl/sourcing`, run a query, and in the browser evaluate the `/api/sourcing` response — confirm it carries `personalization` (the UI rendering is Layer 3 / a later plan; here just confirm the payload).

- [ ] **Step 4: Anonymous parity**

Logged out (or a customer with no `tese_user_id`): run the same query; confirm the response has **no** `personalization` key and matches today's shape.

- [ ] **Step 5: Failure fallback**

Temporarily point `AI_ORCHESTRATOR_API_URL` at a bad tenant or set an invalid tenant id → confirm the search still returns a normal (generic) result, not an error to the user.

- [ ] **Step 6: Record results in the ledger** (no code commit).

---

## Self-Review

**Spec coverage (L1+L2):**
- Storefront forwards `tese_user_id` → Task 5. ✓
- tese-backend resolves primary tenant + forwards `tenant_id` → Task 4. ✓
- Orchestrator: structured tenant profile (TenantSummary, not full get_project_context — noted deviation) → Task 2/3. ✓
- Orchestrator: semantic `TenantSelfIntelligence` retrieval (tenant-scoped via `_bounded_search`) → Task 2. ✓
- Ranking boost → Task 2 (`boost_candidates`) applied in Task 3. ✓
- Prompt injection → Task 3 (`build_tenant_block` + `_build_user_prompt`). ✓
- Response contract (`personalization` + per-pick `match_reasons`) → Task 1 (schema) + Task 3 (populate). ✓
- Best-effort / anonymous parity → Task 3 (guard on `req.tenant_id`), Task 4/5 (best-effort resolve), Task 6 Steps 4–5. ✓
- Privacy (own tenant only; tenant-scoped Weaviate; no financials) → Task 2 (`.with_tenant` via `_bounded_search`; only profile/goals/facts fields). ✓
- Multi-tenant primary rule → Task 4 (`_resolvePrimaryTenantId`). ✓

**Deviations from spec (intentional, better):** (1) reuse `get_tenant`/`_project_tenant_summary`/`TenantSummary` instead of `get_project_context` (which needs polygon/location/activities a buyer lacks); (2) resolve tenant via a direct `UserTenantV2` query instead of `getUserTenantAccessRoleByUserId` (which has a stray symbol ref + unrelated StoreDetail enrichment). Both preserve the spec's intent.

**Placeholder scan:** none — full code/tests/commands. The two "confirm the export name / adapt if signature differs" notes (UserTenantV2 import; `get_tenant` signature) are explicit verification steps with a concrete fallback, not placeholders.

**Type consistency:** `tenant_id: Optional[str]` (Task 1) consumed in Task 3 `run_sourcing`; `Personalization{company_name, applied}` (Task 1) built in Task 2 `applied_signals` + Task 3; `CatalogPick.match_reasons` (Task 1) populated in Task 3 `_coerce_picks`; `TenantSummary` fields used (`company_name`, `industry`, `sector`, `sustainability_goals`) match the extracted `context.py` schema; backend `runSourcingSearch({query, chat_history, tenant_id})` matches the Task 4 call.
