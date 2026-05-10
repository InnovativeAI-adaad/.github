# Multi-Agent Orchestration Monorepo

This repository provides a starter monorepo for building a multi-agent orchestration platform with:

- `apps/web`: React + TypeScript + Vite frontend.
- `apps/edge-functions/orchestrate-agents`: Edge function endpoint with:
  - `POST` orchestration session creation
  - `GET` session search
- `packages/shared`: Shared types/interfaces for agents, consensus metrics, and session records.
- `packages/ui`: Reusable UI components (cards, charts, filters, panels).

## 1) Prerequisites

- Node.js 20+
- pnpm 9+
- (Optional) Supabase CLI for local edge-function workflows

## 2) Install dependencies

```bash
pnpm install
```

## 3) Configure environment variables

Copy the sample env file and fill in values:

```bash
cp .env.example .env
```

### Required environment variables

- `VITE_API_BASE_URL`: Web app API base URL.
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_ANON_KEY`: Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: Service-role key for server-side operations.
- `DATABASE_URL`: PostgreSQL connection string.
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`: Model provider keys.

## 4) Run local development

### Run everything in parallel

```bash
pnpm dev
```

### Run only web UI

```bash
pnpm dev:web
```

### Run only edge function

```bash
pnpm dev:edge
```

## 5) Build and verify

```bash
pnpm build
pnpm typecheck
pnpm lint
```

## 6) Deploy guidance

### Web app (`apps/web`)

1. Build with `pnpm --filter @apps/web build`.
2. Deploy `apps/web/dist` to your static host (Vercel, Netlify, Cloudflare Pages, etc.).
3. Set `VITE_API_BASE_URL` in the hosting provider environment settings.

### Edge function (`apps/edge-functions/orchestrate-agents`)

1. Ensure your platform has `SUPABASE_*`, provider API keys, and `DATABASE_URL` configured.
2. Deploy with your platform workflow (e.g., Supabase functions deploy pipeline).
3. Verify:
   - `POST /orchestrate-agents` starts a session.
   - `GET /orchestrate-agents?q=<search-term>` returns filtered sessions.

## 7) Workspace layout

```text
apps/
  web/
  edge-functions/
    orchestrate-agents/
packages/
  shared/
  ui/
```

## 8) Next recommended steps

ADAAD is designed to decouple value creation from time spent:
- Lower marginal cost of software generation
- Continuous iteration without proportional staffing
- Compounding agent lineages instead of static teams
- Defensible infrastructure around autonomous execution and validation

This is not a tooling company.  
It is an **autonomous software infrastructure thesis**.

---

## Principles

- **Autonomy over assistance**  
  Systems act. Humans guide.

- **Execution over theory**  
  Runnable output is the only truth.

- **Safety by design**  
  Failure is expected. Containment is mandatory.

- **Evolution over rewrites**  
  Improve continuously instead of starting over.

- **Reality over demos**  
  Built for real constraints, not slides.

---

## About This Repository

This repository is the **public organizational profile** for InnovativeAI.

It exists to:
- Communicate intent and direction
- Define security and conduct standards
- Serve as the entry point for future releases

It does **not** contain:
- Core ADAAD source code
- Internal architecture
- Experimental systems

Those are released selectively, when ready.

---

## Security

System integrity is a first-class concern.

If you believe you have discovered a security issue:
- Do not open a public issue
- Follow the process defined in `SECURITY.md`

---

## Status

InnovativeAI and ADAAD are under active development.

Public repositories, interfaces, and documentation will be released selectively as systems mature.

---

## Contact

Email: InnovativeAI.adaad@gmail.com
Phone: 1(580)823–9277

---

© InnovativeAI. All rights reserved.
---

## Compliance Boundaries (Payout/Game Aggregation)

Before enabling payout or game aggregation workflows, all implementations MUST enforce the following boundaries:

### Disallowed Behavior (Hard Block)

The system must reject any automation that:
- Violates a platform's Terms of Service
- Facilitates fraud, abuse, deception, account compromise, impersonation, or circumvention
- Attempts unauthorized payout movement or policy evasion

### Allowed Behavior (Conditionally Permitted)

The system may list opportunities and orchestrate payout-adjacent operations only when all controls below pass validation.

### Required Controls

1. **Risk Scoring + Source Verification**
   - Every listed opportunity must include a risk score and source metadata.
   - Only `verified` sources may be listed.
   - High-risk items must be blocked from auto-listing and routed to manual review.

2. **Explicit User Confirmation for Transfers**
   - Any payout transfer action requires explicit, recent, user-bound confirmation.
   - Missing, stale, or mismatched confirmation must hard-fail the request.

3. **Audit Logging for Transfers and API Actions**
   - Log every transfer attempt, block decision, submission, and failure.
   - Log all sensitive API actions (invoked and denied).
   - Include actor, request, timestamp, risk, and decision reason fields.

### Backend Enforcement + Feature Flags

Backend services must enforce these requirements through validation gates and kill-switch flags before executing payout/game aggregation actions.

Reference policy: `profile/compliance_policy.json`

Minimum required flags:
- `block_tos_or_fraud_automation`
- `enable_verified_opportunity_listing`
- `require_transfer_confirmation`
- `enable_transfer_audit_log`
- `enable_game_aggregation`
- `enable_payout_transfers`

`enable_game_aggregation` and `enable_payout_transfers` must default to `false` until compliance controls are verified in the target environment.
- Replace in-memory session storage with persistent DB reads/writes.
- Add auth and session ownership checks.
- Add charts/tables backed by real data.
- Add unit + integration tests for function handlers and UI components.
